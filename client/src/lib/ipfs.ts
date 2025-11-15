/**
 * IPFS Utilities
 * Handles IPFS URL conversion to HTTP gateway URLs for browser compatibility
 */

const IPFS_GATEWAYS = {
  PINATA: 'https://gateway.pinata.cloud/ipfs/',
  IPFS_IO: 'https://ipfs.io/ipfs/',
  CLOUDFLARE: 'https://cloudflare-ipfs.com/ipfs/',
  DWEB: 'https://dweb.link/ipfs/',
};

const DEFAULT_GATEWAY = IPFS_GATEWAYS.PINATA;

/**
 * Convert IPFS URL to HTTP gateway URL
 * @param ipfsUrl - IPFS URL in format ipfs://CID... or raw CID
 * @param gateway - Optional custom gateway URL
 * @returns HTTP URL that browsers can load, or empty string if invalid
 */
export function ipfsToHttp(ipfsUrl: string | null | undefined, gateway: string = DEFAULT_GATEWAY): string {
  // Handle null/undefined/empty
  if (!ipfsUrl || typeof ipfsUrl !== 'string' || ipfsUrl.trim() === '') {
    return '';
  }

  const trimmedUrl = ipfsUrl.trim();

  // Already HTTP URL - return as is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }

  // Convert ipfs:// protocol to HTTP gateway
  if (trimmedUrl.startsWith('ipfs://')) {
    const pathAndCid = trimmedUrl.replace('ipfs://', '');
    if (!pathAndCid) {
      console.warn(`Empty IPFS URL: ${ipfsUrl}`);
      return '';
    }
    // Keep the full path (CID + any nested paths like /metadata.json)
    return `${gateway}${pathAndCid}`;
  }

  // Check if it looks like a raw CID (alphanumeric, case-insensitive)
  // Extract just the CID part (before any slashes for paths)
  const cidMatch = trimmedUrl.match(/^([a-z0-9]+)/i);
  if (cidMatch && cidMatch[1].length >= 10) {
    // Return gateway + full URL (preserves any paths after CID)
    return `${gateway}${trimmedUrl}`;
  }

  // Unknown format
  console.warn(`Unrecognized IPFS URL format: ${ipfsUrl}`);
  return '';
}

/**
 * Get multiple gateway URLs for an IPFS hash (for fallback loading)
 * @param ipfsUrl - IPFS URL
 * @returns Array of HTTP gateway URLs
 */
export function getIPFSGateways(ipfsUrl: string | null | undefined): string[] {
  if (!ipfsUrl) {
    return [];
  }

  const hash = ipfsUrl.replace('ipfs://', '').replace(/^https?:\/\/[^/]+\/ipfs\//, '');
  
  return [
    `${IPFS_GATEWAYS.PINATA}${hash}`,
    `${IPFS_GATEWAYS.CLOUDFLARE}${hash}`,
    `${IPFS_GATEWAYS.IPFS_IO}${hash}`,
    `${IPFS_GATEWAYS.DWEB}${hash}`,
  ];
}

/**
 * Check if a URL is an IPFS URL
 * @param url - URL to check
 * @returns true if URL is IPFS format
 */
export function isIPFSUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  
  return url.startsWith('ipfs://') || 
         url.includes('/ipfs/') ||
         url.startsWith('Qm') ||
         url.startsWith('bafy');
}

/**
 * Extract IPFS hash from any IPFS URL format
 * @param ipfsUrl - IPFS URL
 * @returns IPFS hash (QmXXX... or bafyXXX...)
 */
export function extractIPFSHash(ipfsUrl: string | null | undefined): string {
  if (!ipfsUrl) {
    return '';
  }

  // Remove ipfs:// protocol
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '');
  }

  // Extract from gateway URL
  const match = ipfsUrl.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  if (match) {
    return match[1];
  }

  // If already a hash
  if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('bafy')) {
    return ipfsUrl;
  }

  return ipfsUrl;
}
