import { Contract, BrowserProvider, Interface } from "ethers";

// Contract addresses (env-based with fallback placeholders until Task 7 deployment)
export const CONTRACT_ADDRESSES = {
  NFT: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  MARKETPLACE: import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
};

/**
 * TODO Task 7: Regenerate ABIs from Hardhat compilation artifacts
 * 
 * Current ABIs are hand-written for stub development and will be replaced with
 * compiler-generated ABIs in Task 7 after fixing contract compilation errors.
 * 
 * Known Issues:
 * - Hardhat v2 downgraded successfully ✅
 * - hardhat.config.cjs created for ESM compatibility ✅
 * - Compilation error: "delete euint128" not allowed (ConfidentialERC721.sol:263)
 * - Contract fixes needed before ABI generation
 * 
 * Procedure for Task 7:
 * 1. Fix contract error: Remove/refactor `delete _encryptedRarity[tokenId]` line 263
 * 2. Run: npx hardhat compile
 * 3. Extract ABIs from: artifacts/contracts/<Contract>.sol/<Contract>.json
 * 4. Replace CONFIDENTIAL_ERC721_ABI and CONFIDENTIAL_MARKETPLACE_ABI below
 * 5. fhEVM einput types will compile to tuple(bytes32[] handles, bytes inputProof)
 * 
 * Current ABIs work with fhevmjs stub for UI development.
 */

// Contract ABIs (minimal interface for our needs)
export const CONFIDENTIAL_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function isSupplyEncrypted() view returns (bool)",
  "function owner() view returns (address)",
  "function balanceOf(address account) view returns (uint128)",
  "function transfer(address to, bytes32 encryptedAmount, bytes calldata proof) returns (bool)",
  "function approve(address spender, bytes32 encryptedAmount, bytes calldata proof) returns (bool)",
  "function transferFrom(address from, address to, bytes32 encryptedAmount, bytes calldata proof) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint128)",
  "function mint(address to, uint256 amount)",
  "function requestTotalSupplyDecryption() returns (uint256)",
  "event Transfer(address indexed from, address indexed to)",
  "event Approval(address indexed owner, address indexed spender)",
  "event TotalSupplyRevealed(uint256 amount)"
];

export const CONFIDENTIAL_PRESALE_ABI = [
  "function tokenAddress() view returns (address)",
  "function owner() view returns (address)",
  "function rate() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function softCap() view returns (uint256)",
  "function minContribution() view returns (uint256)",
  "function maxContribution() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function isEncrypted() view returns (bool)",
  "function totalRaised() view returns (uint256)",
  "function totalContributors() view returns (uint256)",
  "function finalized() view returns (bool)",
  "function softCapReached() view returns (bool)",
  "function contributions(address) view returns (uint256)",
  "function hasClaimed(address) view returns (bool)",
  "function contribute() payable",
  "function contributeEncrypted(bytes32 encryptedAmount, bytes calldata proof) payable",
  "function finalize()",
  "function claimTokens()",
  "function claimRefund()",
  "function getEncryptedContribution(address contributor) view returns (uint128)",
  "function isActive() view returns (bool)",
  "function getPresaleInfo() view returns (uint256 totalRaised, uint256 totalContributors, bool isActive, bool softCapReached, bool finalized)",
  "event Contribution(address indexed contributor, bool encrypted)",
  "event TokensClaimed(address indexed contributor, uint256 amount)",
  "event PresaleFinalized(bool success, uint256 totalRaised)",
  "event RefundClaimed(address indexed contributor, uint256 amount)"
];

export const CONFIDENTIAL_ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function publicMintEnabled() view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function hasEncryptedMetadata(uint256 tokenId) view returns (bool)",
  "function mint(string tokenURI) payable returns (uint256)",
  "function mintWithEncryptedRarity(string tokenURI, bytes32 encryptedRarity, bytes rarityProof) payable returns (uint256)",
  "function mintWithEncryptedAttributes(address to, string tokenURI, bytes32 encryptedRarity, bytes rarityProof, bytes32[] encryptedAttrs, bytes[] attrProofs) payable returns (uint256)",
  "function requestRarityReveal(uint256 tokenId) returns (uint256)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, string uri, bool hasEncrypted)",
  "event RarityRevealed(uint256 indexed tokenId, uint128 rarity)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

export const CONFIDENTIAL_MARKETPLACE_ABI = [
  "function platformFeeBasisPoints() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function listingCount() view returns (uint256)",
  "function offerCount() view returns (uint256)",
  "function auctionCount() view returns (uint256)",
  "function listings(uint256 listingId) view returns (address nftContract, uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt)",
  "function offers(uint256 offerId) view returns (address nftContract, uint256 tokenId, address bidder, uint256 amount, bool isActive, uint256 createdAt, uint256 expiresAt)",
  "function auctions(uint256 auctionId) view returns (address nftContract, uint256 tokenId, address seller, uint256 reservePrice, uint256 highestBid, address highestBidder, uint256 startTime, uint256 endTime, bool isActive, bool isFinalized)",
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (uint256)",
  "function cancelListing(uint256 listingId)",
  "function buyNFT(uint256 listingId) payable",
  "function makeOffer(address nftContract, uint256 tokenId, uint256 expiresAt) payable returns (uint256)",
  "function cancelOffer(uint256 offerId)",
  "function acceptOffer(uint256 offerId)",
  "function createAuction(address nftContract, uint256 tokenId, uint256 reservePrice, uint256 duration) returns (uint256)",
  "function placeBid(uint256 auctionId) payable",
  "function finalizeAuction(uint256 auctionId)",
  "event NFTListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price)",
  "event NFTSold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price)",
  "event ListingCancelled(uint256 indexed listingId)",
  "event OfferMade(uint256 indexed offerId, address indexed nftContract, uint256 indexed tokenId, address bidder, uint256 amount)",
  "event OfferAccepted(uint256 indexed offerId, address seller)",
  "event OfferCancelled(uint256 indexed offerId)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed nftContract, uint256 indexed tokenId, uint256 reservePrice, uint256 endTime)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionFinalized(uint256 indexed auctionId, address winner, uint256 finalPrice)"
];

/**
 * Get ConfidentialToken contract instance
 */
export function getTokenContract(
  address: string,
  provider: BrowserProvider
): Contract {
  return new Contract(address, CONFIDENTIAL_TOKEN_ABI, provider);
}

/**
 * Get ConfidentialPresale contract instance
 */
export function getPresaleContract(
  address: string,
  provider: BrowserProvider
): Contract {
  return new Contract(address, CONFIDENTIAL_PRESALE_ABI, provider);
}

/**
 * Get ConfidentialERC721 (NFT) contract instance
 */
export function getNFTContract(
  address: string,
  provider: BrowserProvider
): Contract {
  return new Contract(address, CONFIDENTIAL_ERC721_ABI, provider);
}

/**
 * Get ConfidentialMarketplace contract instance
 */
export function getMarketplaceContract(
  address: string,
  provider: BrowserProvider
): Contract {
  return new Contract(address, CONFIDENTIAL_MARKETPLACE_ABI, provider);
}

/**
 * Deploy ConfidentialToken contract
 * @param provider Ethers provider with signer
 * @param name Token name
 * @param symbol Token symbol
 * @param decimals Token decimals
 * @param totalSupply Total supply
 * @param encryptSupply Whether to encrypt total supply
 * @returns Deployed contract instance and transaction
 */
export async function deployToken(
  provider: BrowserProvider,
  name: string,
  symbol: string,
  decimals: number,
  totalSupply: bigint,
  encryptSupply: boolean
) {
  const signer = await provider.getSigner();
  
  // Note: In production, you'd import the actual contract factory from Hardhat artifacts
  // For now, this is a placeholder that assumes the contract is already deployed
  throw new Error("Contract deployment from frontend not yet implemented. Use Hardhat scripts instead.");
}

/**
 * Check if address is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 42) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Parse contract error message (exported for use in hooks)
 */
export function parseContractError(error: any): string {
  if (error?.reason) return error.reason;
  if (error?.message) {
    // Extract revert reason from error message
    const match = error.message.match(/reason="([^"]+)"/);
    if (match) return match[1];
    return error.message;
  }
  return "Transaction failed";
}
