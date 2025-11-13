/**
 * IPFS/Arweave Metadata Storage Helpers
 * Utilities for uploading and retrieving NFT metadata and images
 */

export interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  encryptedRarity?: string;
  encryptedAttributes?: string;
}

/**
 * Upload image to IPFS (Pinata or NFT.Storage)
 * @param file Image file buffer or blob
 * @returns IPFS URL (ipfs://...)
 */
export async function uploadImageToIPFS(file: Buffer | Blob): Promise<string> {
  // TODO: Implement IPFS upload using Pinata or NFT.Storage
  // Example with Pinata:
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
  //   body: formData
  // });
  // const { IpfsHash } = await response.json();
  // return `ipfs://${IpfsHash}`;
  
  throw new Error("IPFS upload not yet implemented - requires Pinata/NFT.Storage API key");
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata NFT metadata object
 * @returns IPFS URL (ipfs://...)
 */
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  // TODO: Implement metadata upload
  // const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  // return uploadImageToIPFS(blob);
  
  throw new Error("Metadata upload not yet implemented");
}

/**
 * Upload to Arweave for permanent storage
 * @param data File buffer or JSON
 * @returns Arweave transaction ID
 */
export async function uploadToArweave(data: Buffer | object): Promise<string> {
  // TODO: Implement Arweave upload using arweave-js
  // Example:
  // const arweave = Arweave.init({
  //   host: 'arweave.net',
  //   port: 443,
  //   protocol: 'https'
  // });
  // const transaction = await arweave.createTransaction({ data });
  // await arweave.transactions.sign(transaction, jwk);
  // await arweave.transactions.post(transaction);
  // return transaction.id;
  
  throw new Error("Arweave upload not yet implemented - requires Arweave wallet");
}

/**
 * Fetch metadata from IPFS gateway
 * @param ipfsUrl IPFS URL (ipfs://... or https://gateway...)
 * @returns Metadata object
 */
export async function fetchMetadataFromIPFS(ipfsUrl: string): Promise<NFTMetadata> {
  const gatewayUrl = ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  const response = await fetch(gatewayUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Convert IPFS URL to HTTP gateway URL
 * @param ipfsUrl IPFS URL (ipfs://...)
 * @param gateway Gateway domain (default: ipfs.io)
 * @returns HTTP URL
 */
export function ipfsToHTTP(ipfsUrl: string, gateway = 'ipfs.io'): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', `https://${gateway}/ipfs/`);
  }
  return ipfsUrl;
}

/**
 * Generate metadata JSON for NFT
 * @param params NFT parameters
 * @returns Metadata object
 */
export function createNFTMetadata(params: {
  name: string;
  description?: string;
  imageUrl: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  encryptedRarity?: string;
  encryptedAttributes?: string;
}): NFTMetadata {
  return {
    name: params.name,
    description: params.description,
    image: params.imageUrl,
    attributes: params.attributes,
    encryptedRarity: params.encryptedRarity,
    encryptedAttributes: params.encryptedAttributes,
  };
}
