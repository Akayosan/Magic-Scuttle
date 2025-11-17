import { BrowserProvider } from "ethers";
import { createInstance, FhevmInstance } from "@zama-fhe/relayer-sdk/web";

let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize fhEVM instance for encrypted operations on Sepolia testnet
 * Uses @zama-fhe/relayer-sdk v0.2.0+ (migrated from deprecated fhevmjs v0.6.2)
 * @param provider Ethers BrowserProvider (not used, but kept for API compatibility)
 * @returns Initialized fhEVM instance
 */
export async function getFhevmInstance(provider: BrowserProvider): Promise<FhevmInstance> {
  if (fhevmInstance) {
    console.log("⚠️ Using cached fhEVM instance");
    return fhevmInstance;
  }

  if (!window.ethereum) {
    throw new Error("MetaMask or Web3 wallet not found. Please install a Web3 wallet to use encrypted features.");
  }

  try {
    console.log("🔧 Initializing fhEVM using @zama-fhe/relayer-sdk...");
    console.log("📅 Code version: 2025-11-14-v8-RELAYER-SDK");
    
    // Official configuration from Zama docs
    // Source: https://docs.zama.org/protocol/relayer-sdk-guides/fhevm-relayer/initialization
    const config = {
      // FHEVM Host chain addresses (Sepolia)
      aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
      kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
      inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
      
      // Gateway chain addresses
      verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
      verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
      
      // Chain IDs
      chainId: 11155111, // Sepolia testnet
      gatewayChainId: 55815, // Gateway chain ID
      
      // Network RPC (optional but recommended)
      network: 'https://eth-sepolia.public.blastapi.io',
      
      // Relayer URL (REQUIRED - official Zama relayer)
      relayerUrl: 'https://relayer.testnet.zama.cloud',
    };
    
    console.log("✅ Creating fhEVM instance with config:", {
      ...config,
      network: '(RPC URL hidden)',
    });
    
    // Create fhEVM instance
    fhevmInstance = await createInstance(config);
    
    console.log("🎉 fhEVM instance created successfully");
    console.log("✅ Ready for encrypted operations on Sepolia testnet");
    return fhevmInstance;
  } catch (error: any) {
    console.error("❌ Failed to initialize fhEVM - Detailed error:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    throw new Error(`Failed to initialize fhEVM instance: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Create encrypted input for smart contract
 * @param instance fhEVM instance
 * @param contractAddress Target contract address
 * @param userAddress User address creating the input
 * @returns Encrypted input creator
 */
export async function createEncryptedInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string
) {
  return instance.createEncryptedInput(contractAddress, userAddress);
}

/**
 * Request decryption of encrypted value
 * @param instance fhEVM instance
 * @param contractAddress Contract containing the encrypted value
 * @param ciphertext Encrypted value to decrypt
 * @returns Decrypted value
 * @deprecated Public decryption workflow changed in v0.9 - use self-relaying pattern
 */
export async function requestDecryption(
  instance: FhevmInstance,
  contractAddress: string,
  ciphertext: string
): Promise<bigint> {
  try {
    // @ts-ignore - decrypt method availability depends on SDK version
    const decrypted = await instance.decrypt(contractAddress, ciphertext);
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt value");
  }
}

/**
 * Reset fhEVM instance (useful when switching networks)
 */
export function resetFhevmInstance() {
  fhevmInstance = null;
  console.log("fhEVM instance reset");
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
