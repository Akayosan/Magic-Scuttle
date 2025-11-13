// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ConfidentialERC721
 * @notice Privacy-preserving NFT contract using Zama fhEVM v0.9
 * @dev Extends OpenZeppelin ERC721 with encrypted metadata attributes
 */
contract ConfidentialERC721 is ERC721, ERC721Royalty, ReentrancyGuard, Ownable, GatewayCaller {
    using Strings for uint256;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Total supply and max supply
    uint256 private _totalSupply;
    uint256 public maxSupply;
    
    // Next token ID to mint
    uint256 private _nextTokenId;
    
    // Public minting enabled
    bool public publicMintEnabled;
    
    // Mint price
    uint256 public mintPrice;
    
    // Token URIs (tokenId => metadata URI)
    mapping(uint256 => string) private _tokenURIs;
    
    // Encrypted rarity scores (tokenId => encrypted rarity 0-100)
    mapping(uint256 => euint128) private _encryptedRarity;
    
    // Encrypted attributes (tokenId => attributeIndex => encrypted value)
    mapping(uint256 => mapping(uint256 => euint128)) private _encryptedAttributes;
    
    // Number of encrypted attributes per token
    mapping(uint256 => uint256) private _attributeCount;
    
    // Track if token has encrypted metadata
    mapping(uint256 => bool) public hasEncryptedMetadata;
    
    // Decryption request tracking (requestId => tokenId)
    mapping(uint256 => uint256) private _decryptionRequests;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri, bool hasEncrypted);
    event RarityRevealed(uint256 indexed tokenId, uint128 rarity);
    event PublicMintToggled(bool enabled);
    event MintPriceUpdated(uint256 newPrice);
    
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint96 royaltyBasisPoints_,
        uint256 mintPrice_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        require(maxSupply_ > 0, "Max supply must be positive");
        require(royaltyBasisPoints_ <= 1000, "Royalty too high"); // Max 10%
        
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        publicMintEnabled = false;
        
        // Set default royalty for all tokens
        _setDefaultRoyalty(msg.sender, royaltyBasisPoints_);
    }
    
    /**
     * @notice Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @notice Toggle public minting (owner only)
     */
    function setPublicMintEnabled(bool enabled) external onlyOwner {
        publicMintEnabled = enabled;
        emit PublicMintToggled(enabled);
    }
    
    /**
     * @notice Update mint price (owner only)
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @notice Mint NFT with public metadata only
     */
    function mint(string memory tokenURI_) public payable nonReentrant returns (uint256) {
        if (!publicMintEnabled) {
            require(msg.sender == owner(), "Public mint disabled");
        }
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_totalSupply < maxSupply, "Max supply reached");
        
        uint256 tokenId = _nextTokenId++;
        _totalSupply++;
        
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        
        // Refund excess payment using safe call
        if (msg.value > mintPrice) {
            (bool success,) = payable(msg.sender).call{value: msg.value - mintPrice}("");
            require(success, "Refund failed");
        }
        
        emit NFTMinted(msg.sender, tokenId, tokenURI_, false);
        return tokenId;
    }
    
    /**
     * @notice Mint NFT with encrypted rarity
     */
    function mintWithEncryptedRarity(
        string memory tokenURI_,
        einput encryptedRarity_,
        bytes calldata rarityProof_
    ) public payable nonReentrant returns (uint256) {
        if (!publicMintEnabled) {
            require(msg.sender == owner(), "Public mint disabled");
        }
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_totalSupply < maxSupply, "Max supply reached");
        
        uint256 tokenId = _nextTokenId++;
        _totalSupply++;
        
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        
        // Store encrypted rarity
        euint128 rarityValue = TFHE.asEuint128(encryptedRarity_, rarityProof_);
        _encryptedRarity[tokenId] = rarityValue;
        TFHE.allow(rarityValue, msg.sender);
        TFHE.allowThis(rarityValue);
        hasEncryptedMetadata[tokenId] = true;
        
        // Refund excess payment using safe call
        if (msg.value > mintPrice) {
            (bool success,) = payable(msg.sender).call{value: msg.value - mintPrice}("");
            require(success, "Refund failed");
        }
        
        emit NFTMinted(msg.sender, tokenId, tokenURI_, true);
        return tokenId;
    }
    
    /**
     * @notice Mint NFT with encrypted attributes (owner or authorized)
     */
    function mintWithEncryptedAttributes(
        address to,
        string memory tokenURI_,
        einput encryptedRarity_,
        bytes calldata rarityProof_,
        einput[] calldata encryptedAttrs_,
        bytes[] calldata attrProofs_
    ) public onlyOwner nonReentrant returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(_totalSupply < maxSupply, "Max supply reached");
        require(encryptedAttrs_.length == attrProofs_.length, "Mismatched arrays");
        require(encryptedAttrs_.length <= 10, "Too many attributes");
        
        uint256 tokenId = _nextTokenId++;
        _totalSupply++;
        
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        
        // Store encrypted rarity
        euint128 rarityValue = TFHE.asEuint128(encryptedRarity_, rarityProof_);
        _encryptedRarity[tokenId] = rarityValue;
        TFHE.allow(rarityValue, to);
        TFHE.allowThis(rarityValue);
        
        // Store encrypted attributes
        for (uint256 i = 0; i < encryptedAttrs_.length; i++) {
            euint128 attrValue = TFHE.asEuint128(encryptedAttrs_[i], attrProofs_[i]);
            _encryptedAttributes[tokenId][i] = attrValue;
            TFHE.allow(attrValue, to);
            TFHE.allowThis(attrValue);
        }
        _attributeCount[tokenId] = encryptedAttrs_.length;
        hasEncryptedMetadata[tokenId] = true;
        
        emit NFTMinted(to, tokenId, tokenURI_, true);
        return tokenId;
    }
    
    /**
     * @notice Batch mint (owner only)
     */
    function batchMint(address to, uint256 quantity, string memory baseTokenURI_) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(to != address(0), "Invalid recipient");
        require(quantity > 0 && quantity <= 100, "Invalid quantity");
        require(_totalSupply + quantity <= maxSupply, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _totalSupply++;
            
            _safeMint(to, tokenId);
            _tokenURIs[tokenId] = string(abi.encodePacked(baseTokenURI_, tokenId.toString()));
            
            emit NFTMinted(to, tokenId, _tokenURIs[tokenId], false);
        }
    }
    
    /**
     * @notice Override transfer to update encrypted data permissions
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        
        // Update encrypted data permissions on transfer
        if (to != address(0) && hasEncryptedMetadata[tokenId]) {
            TFHE.allow(_encryptedRarity[tokenId], to);
            
            // Update all attribute permissions
            for (uint256 i = 0; i < _attributeCount[tokenId]; i++) {
                TFHE.allow(_encryptedAttributes[tokenId][i], to);
            }
        }
        
        return from;
    }
    
    /**
     * @notice Burn NFT
     */
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        _totalSupply--;
        
        // Clean up encrypted data
        if (hasEncryptedMetadata[tokenId]) {
            delete _encryptedRarity[tokenId];
            uint256 attrCount = _attributeCount[tokenId];
            for (uint256 i = 0; i < attrCount; i++) {
                delete _encryptedAttributes[tokenId][i];
            }
            delete _attributeCount[tokenId];
            delete hasEncryptedMetadata[tokenId];
        }
        
        delete _tokenURIs[tokenId];
        _burn(tokenId);
    }
    
    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        _requireOwned(tokenId);
        
        string memory _tokenURI = _tokenURIs[tokenId];
        
        // If custom URI exists, return it
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }
        
        // Otherwise return base URI + tokenId
        string memory base = _baseURI();
        return bytes(base).length > 0 
            ? string(abi.encodePacked(base, tokenId.toString())) 
            : "";
    }
    
    /**
     * @notice Get base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Update base URI (owner only)
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @notice Get encrypted rarity
     */
    function getEncryptedRarity(uint256 tokenId) public view returns (euint128) {
        require(hasEncryptedMetadata[tokenId], "No encrypted metadata");
        return _encryptedRarity[tokenId];
    }
    
    /**
     * @notice Get encrypted attribute
     */
    function getEncryptedAttribute(uint256 tokenId, uint256 attributeIndex) 
        public 
        view 
        returns (euint128) 
    {
        require(hasEncryptedMetadata[tokenId], "No encrypted metadata");
        require(attributeIndex < _attributeCount[tokenId], "Invalid attribute index");
        return _encryptedAttributes[tokenId][attributeIndex];
    }
    
    /**
     * @notice Get attribute count
     */
    function getAttributeCount(uint256 tokenId) public view returns (uint256) {
        return _attributeCount[tokenId];
    }
    
    /**
     * @notice Request rarity decryption (owner only)
     */
    function requestRarityDecryption(uint256 tokenId) public returns (uint256) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(hasEncryptedMetadata[tokenId], "No encrypted metadata");
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(_encryptedRarity[tokenId]);
        
        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackRarityDecryption.selector,
            0,
            block.timestamp + 100,
            false
        );
        
        _decryptionRequests[requestId] = tokenId;
        return requestId;
    }
    
    /**
     * @notice Callback for rarity decryption
     */
    function callbackRarityDecryption(
        uint256 requestId,
        uint128 decryptedRarity
    ) public onlyGateway {
        uint256 tokenId = _decryptionRequests[requestId];
        delete _decryptionRequests[requestId];
        
        emit RarityRevealed(tokenId, decryptedRarity);
    }
    
    /**
     * @notice Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @notice Override supportsInterface for ERC721Royalty
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
