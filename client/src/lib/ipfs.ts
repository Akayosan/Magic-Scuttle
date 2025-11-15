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
 * @param ipfsUrl - IPFS URL in format ipfs://QmXXX... or https://...
 * @param gateway - Optional custom gateway URL
 * @returns HTTP URL that browsers can load
 */
export function ipfsToHttp(ipfsUrl: string | null | undefined, gateway: string = DEFAULT_GATEWAY): string {
  if (!ipfsUrl) {
    return '';
  }

  // Already HTTP URL
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl;
  }

  // Convert ipfs:// to HTTP gateway
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `${gateway}${hash}`;
  }

  // If it's just a hash (QmXXX...)
  if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('bafy')) {
    return `${gateway}${ipfsUrl}`;
  }

  // Fallback: return as-is
  return ipfsUrl;
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
