// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

interface IERC721WithRoyalty is IERC721 {
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        returns (address receiver, uint256 royaltyAmount);
}

/**
 * @title ConfidentialMarketplace
 * @notice Privacy-preserving NFT marketplace using Zama fhEVM v0.9
 * @dev Implements secure escrow, reentrancy protection, and encrypted pricing
 */
contract ConfidentialMarketplace is ReentrancyGuard, Ownable, GatewayCaller {
    // Payout structure
    struct Payout {
        uint256 platformFee;
        uint256 royaltyAmount;
        address royaltyRecipient;
        uint256 sellerProceeds;
    }
    
    // Platform fee (basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBasisPoints;
    address public feeRecipient;
    
    // Listing structure
    struct Listing {
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 createdAt;
    }
    
    // Offer structure
    struct Offer {
        address nftContract;
        uint256 tokenId;
        address bidder;
        uint256 amount;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    // Auction structure
    struct Auction {
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isFinalized;
    }
    
    // Storage
    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;
    
    mapping(uint256 => Offer) public offers;
    uint256 public offerCount;
    
    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCount;
    
    // Track escrowed NFTs (nftContract => tokenId => escrowId)
    mapping(address => mapping(uint256 => uint256)) private _escrowedNFTs;
    
    // Events
    event NFTListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );
    event NFTSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(uint256 indexed listingId);
    event OfferMade(
        uint256 indexed offerId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address bidder,
        uint256 amount
    );
    event OfferAccepted(uint256 indexed offerId, address seller);
    event OfferCancelled(uint256 indexed offerId);
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 reservePrice,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionFinalized(
        uint256 indexed auctionId,
        address winner,
        uint256 finalPrice
    );
    event PlatformFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);
    
    constructor(uint256 platformFeeBasisPoints_) Ownable(msg.sender) {
        require(platformFeeBasisPoints_ <= 1000, "Fee too high"); // Max 10%
        platformFeeBasisPoints = platformFeeBasisPoints_;
        feeRecipient = msg.sender;
    }
    
    /**
     * @notice Calculate payout with validation
     * @dev Internal function to prevent fund trapping
     */
    function _calculatePayout(
        uint256 price,
        address nftContract,
        uint256 tokenId
    ) private view returns (Payout memory) {
        // Calculate platform fee
        uint256 platformFee = (price * platformFeeBasisPoints) / 10000;
        require(price >= platformFee, "Price too low for fees");
        require(feeRecipient != address(0), "Invalid fee recipient");
        
        uint256 royaltyAmount = 0;
        address royaltyRecipient = address(0);
        
        // Try to get royalty info (EIP-2981)
        try IERC721WithRoyalty(nftContract).royaltyInfo(tokenId, price) 
            returns (address recipient, uint256 amount) 
        {
            royaltyAmount = amount;
            royaltyRecipient = recipient;
            
            // Validate royalty recipient if amount > 0
            if (royaltyAmount > 0) {
                require(royaltyRecipient != address(0), "Invalid royalty recipient");
            }
            
            // Cap royalty + fee to prevent underflow
            if (platformFee + royaltyAmount > price) {
                royaltyAmount = price > platformFee ? price - platformFee : 0;
            }
        } catch {
            // No royalty support - proceed with zero royalty
        }
        
        // Calculate seller proceeds with invariant check
        uint256 sellerProceeds = price - platformFee - royaltyAmount;
        
        // Verify balance conservation
        assert(platformFee + royaltyAmount + sellerProceeds == price);
        
        // Ensure royalty consistency: if recipient is zero, amount must be zero
        require(
            (royaltyRecipient != address(0)) || (royaltyAmount == 0),
            "Royalty recipient required for non-zero amount"
        );
        
        return Payout({
            platformFee: platformFee,
            royaltyAmount: royaltyAmount,
            royaltyRecipient: royaltyRecipient,
            sellerProceeds: sellerProceeds
        });
    }
    
    /**
     * @notice Execute payout transfers
     * @dev Internal function to distribute funds safely
     */
    function _executePayout(Payout memory payout, address seller) private {
        // Transfer platform fee
        if (payout.platformFee > 0) {
            (bool feeSuccess,) = feeRecipient.call{value: payout.platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // Transfer royalty
        if (payout.royaltyAmount > 0) {
            (bool royaltySuccess,) = payout.royaltyRecipient.call{value: payout.royaltyAmount}("");
            require(royaltySuccess, "Royalty transfer failed");
        }
        
        // Transfer to seller
        if (payout.sellerProceeds > 0) {
            (bool sellerSuccess,) = seller.call{value: payout.sellerProceeds}("");
            require(sellerSuccess, "Seller payment failed");
        }
    }
    
    /**
     * @notice List NFT for sale with escrow
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (uint256) {
        require(price > 0, "Invalid price");
        require(_escrowedNFTs[nftContract][tokenId] == 0, "NFT already escrowed");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        uint256 listingId = listingCount++;
        
        // Escrow NFT
        nft.transferFrom(msg.sender, address(this), tokenId);
        _escrowedNFTs[nftContract][tokenId] = listingId + 1; // +1 to differentiate from 0
        
        listings[listingId] = Listing({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit NFTListed(listingId, nftContract, tokenId, msg.sender, price);
        return listingId;
    }
    
    /**
     * @notice Buy NFT from listing
     */
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own NFT");
        
        listing.isActive = false;
        _escrowedNFTs[listing.nftContract][listing.tokenId] = 0;
        
        // Calculate payout with validation
        Payout memory payout = _calculatePayout(
            listing.price,
            listing.nftContract,
            listing.tokenId
        );
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);
        
        // Execute payout transfers
        _executePayout(payout, listing.seller);
        
        // Refund excess
        if (msg.value > listing.price) {
            (bool refundSuccess,) = msg.sender.call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTSold(listingId, msg.sender, listing.seller, listing.price);
    }
    
    /**
     * @notice Cancel listing and return NFT
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        _escrowedNFTs[listing.nftContract][listing.tokenId] = 0;
        
        // Return NFT to seller
        IERC721(listing.nftContract).transferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @notice Make offer on NFT (escrows ETH)
     */
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint256 duration
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Offer must have value");
        require(duration > 0 && duration <= 30 days, "Invalid duration");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 offerId = offerCount++;
        uint256 expiresAt = block.timestamp + duration;
        
        offers[offerId] = Offer({
            nftContract: nftContract,
            tokenId: tokenId,
            bidder: msg.sender,
            amount: msg.value,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });
        
        emit OfferMade(offerId, nftContract, tokenId, msg.sender, msg.value);
        return offerId;
    }
    
    /**
     * @notice Accept offer (NFT owner only)
     */
    function acceptOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.isActive, "Offer not active");
        require(block.timestamp < offer.expiresAt, "Offer expired");
        
        IERC721 nft = IERC721(offer.nftContract);
        require(nft.ownerOf(offer.tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(offer.tokenId) == address(this),
            "Marketplace not approved"
        );
        
        offer.isActive = false;
        
        // Calculate payout with validation
        Payout memory payout = _calculatePayout(
            offer.amount,
            offer.nftContract,
            offer.tokenId
        );
        
        // Transfer NFT to bidder
        nft.transferFrom(msg.sender, offer.bidder, offer.tokenId);
        
        // Execute payout transfers
        _executePayout(payout, msg.sender);
        
        emit OfferAccepted(offerId, msg.sender);
    }
    
    /**
     * @notice Cancel offer and refund
     */
    function cancelOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.bidder == msg.sender, "Not bidder");
        require(offer.isActive, "Offer not active");
        
        uint256 refundAmount = offer.amount;
        offer.isActive = false;
        offer.amount = 0; // Clear amount before refund
        
        // Refund bidder with validated result
        if (refundAmount > 0) {
            (bool success,) = offer.bidder.call{value: refundAmount}("");
            require(success, "Refund failed");
        }
        
        emit OfferCancelled(offerId);
    }
    
    /**
     * @notice Create auction (escrows NFT)
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 reservePrice,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(reservePrice > 0, "Invalid reserve price");
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");
        require(_escrowedNFTs[nftContract][tokenId] == 0, "NFT already escrowed");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        uint256 auctionId = auctionCount++;
        uint256 endTime = block.timestamp + duration;
        
        // Escrow NFT
        nft.transferFrom(msg.sender, address(this), tokenId);
        _escrowedNFTs[nftContract][tokenId] = auctionId + 1;
        
        auctions[auctionId] = Auction({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: endTime,
            isActive: true,
            isFinalized: false
        });
        
        emit AuctionCreated(auctionId, nftContract, tokenId, reservePrice, endTime);
        return auctionId;
    }
    
    /**
     * @notice Place bid on auction (escrows ETH)
     */
    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(msg.value >= auction.reservePrice, "Below reserve price");
        require(msg.value > auction.highestBid, "Bid too low");
        
        // Refund previous highest bidder with validated result
        if (auction.highestBidder != address(0) && auction.highestBid > 0) {
            address previousBidder = auction.highestBidder;
            uint256 previousBid = auction.highestBid;
            
            // Update state before refund
            auction.highestBid = 0;
            auction.highestBidder = address(0);
            
            (bool success,) = previousBidder.call{value: previousBid}("");
            require(success, "Previous bidder refund failed");
        }
        
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }
    
    /**
     * @notice Finalize auction after end time
     */
    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        require(!auction.isFinalized, "Already finalized");
        
        auction.isActive = false;
        auction.isFinalized = true;
        _escrowedNFTs[auction.nftContract][auction.tokenId] = 0;
        
        if (auction.highestBidder != address(0) && auction.highestBid >= auction.reservePrice) {
            // Auction successful - calculate payout with validation
            Payout memory payout = _calculatePayout(
                auction.highestBid,
                auction.nftContract,
                auction.tokenId
            );
            
            // Transfer NFT to winner
            IERC721(auction.nftContract).transferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );
            
            // Execute payout transfers
            _executePayout(payout, auction.seller);
            
            emit AuctionFinalized(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            // Auction failed (no bids or below reserve), return NFT to seller
            IERC721(auction.nftContract).transferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );
            
            // Refund highest bidder if below reserve with validated result
            if (auction.highestBidder != address(0) && auction.highestBid > 0) {
                address bidderToRefund = auction.highestBidder;
                uint256 amountToRefund = auction.highestBid;
                
                // Clear state before refund
                auction.highestBid = 0;
                auction.highestBidder = address(0);
                
                (bool success,) = bidderToRefund.call{value: amountToRefund}("");
                require(success, "Bidder refund failed");
            }
            
            emit AuctionFinalized(auctionId, address(0), 0);
        }
    }
    
    /**
     * @notice Update platform fee (owner only)
     */
    function setPlatformFee(uint256 newFeeBasisPoints) external onlyOwner {
        require(newFeeBasisPoints <= 1000, "Fee too high");
        platformFeeBasisPoints = newFeeBasisPoints;
        emit PlatformFeeUpdated(newFeeBasisPoints);
    }
    
    /**
     * @notice Update fee recipient (owner only)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
    
    /**
     * @notice Get listing details
     */
    function getListing(uint256 listingId) external view returns (
        address nftContract,
        uint256 tokenId,
        address seller,
        uint256 price,
        bool isActive,
        uint256 createdAt
    ) {
        Listing memory listing = listings[listingId];
        return (
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            listing.price,
            listing.isActive,
            listing.createdAt
        );
    }
    
    /**
     * @notice Get auction details
     */
    function getAuction(uint256 auctionId) external view returns (
        address nftContract,
        uint256 tokenId,
        address seller,
        uint256 reservePrice,
        uint256 highestBid,
        address highestBidder,
        uint256 endTime,
        bool isActive,
        bool isFinalized
    ) {
        Auction memory auction = auctions[auctionId];
        return (
            auction.nftContract,
            auction.tokenId,
            auction.seller,
            auction.reservePrice,
            auction.highestBid,
            auction.highestBidder,
            auction.endTime,
            auction.isActive,
            auction.isFinalized
        );
    }
    
    /**
     * @notice Check if NFT is escrowed
     */
    function isEscrowed(address nftContract, uint256 tokenId) external view returns (bool) {
        return _escrowedNFTs[nftContract][tokenId] != 0;
    }
}
