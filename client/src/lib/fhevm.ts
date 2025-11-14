import { BrowserProvider } from "ethers";
import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";

let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize fhEVM instance for encrypted operations on Sepolia testnet
 * @param provider Ethers BrowserProvider with EIP-1193 provider
 * @returns Initialized fhEVM instance
 */
export async function getFhevmInstance(provider: BrowserProvider): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    console.log("Step 1: Initializing fhEVM WASM...");
    await initFhevm({
      tfheParams: '/tfhe_bg.wasm',
      kmsParams: '/kms_lib_bg.wasm',
    });
    console.log("Step 2: WASM initialized successfully");
    
    const config = {
      // REQUIRED: Contract Addresses (Host Chain - Sepolia)
      aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
      kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
      
      // REQUIRED: Network Provider (EIP-1193 compatible)
      network: (provider as any).provider, // BrowserProvider.provider is EIP-1193
      
      // OPTIONAL: Chain ID for deterministic network selection
      chainId: 11155111, // Sepolia testnet
      
      // Gateway/Relayer URL (REQUIRED for encrypted operations)
      gatewayUrl: 'https://relayer.testnet.zama.cloud',
    };
    
    console.log("Step 3: Creating fhEVM instance with config:", config);
    
    // Create fhEVM instance with Sepolia testnet configuration
    fhevmInstance = await createInstance(config);
    
    console.log("Step 4: fhEVM instance created successfully");
    console.log("fhEVM initialized successfully for Sepolia testnet");
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
