import { BrowserProvider } from "ethers";
import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";

let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize fhEVM instance for encrypted operations on Sepolia testnet
 * @param provider Ethers provider (not used but kept for API compatibility)
 * @returns Initialized fhEVM instance
 */
export async function getFhevmInstance(provider: BrowserProvider): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    // Initialize WASM for cryptographic operations
    await initFhevm();
    
    // Create fhEVM instance with Sepolia testnet configuration
    fhevmInstance = await createInstance({
      // Chain Configuration
      chainId: 11155111, // Sepolia testnet
      
      // Network URLs
      networkUrl: 'https://eth-sepolia.public.blastapi.io',
      gatewayUrl: 'https://gateway.sepolia.zama.ai/',
      
      // Contract Addresses (Host Chain - Sepolia)
      aclAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
    });
    
    console.log("fhEVM initialized successfully for Sepolia testnet");
    return fhevmInstance;
  } catch (error) {
    console.error("Failed to initialize fhEVM:", error);
    throw new Error("Failed to initialize fhEVM instance");
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
 * @deprecated This function is not yet implemented in fhevmjs v0.6.2
 */
export async function requestDecryption(
  instance: FhevmInstance,
  contractAddress: string,
  ciphertext: string
): Promise<bigint> {
  try {
    // @ts-ignore - decrypt method not available in fhevmjs v0.6.2
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
