import { Contract, BrowserProvider, Interface } from "ethers";

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
 * Parse contract error message
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
