# IPFS Integration Setup Guide

## Overview
The Scuttle NFT platform uses Pinata (https://pinata.cloud) to upload images and metadata to IPFS (InterPlanetary File System) for permanent, decentralized storage.

## Required Configuration

### 1. Get Pinata API Keys
1. Create a free account at https://pinata.cloud
2. Navigate to "API Keys" in your dashboard
3. Click "New Key" and enable these permissions:
   - `pinFileToIPFS` - Upload images/files
   - `pinJSONToIPFS` - Upload metadata JSON
4. Copy both:
   - API Key
   - API Secret

### 2. Add to Replit Secrets
1. Click the padlock icon (🔒) in the left sidebar
2. Add two new secrets:
   - Key: `PINATA_API_KEY`, Value: (your API key)
   - Key: `PINATA_SECRET_KEY`, Value: (your API secret)
3. Restart the application workflow

## API Endpoints

### Upload Image
```bash
POST /api/ipfs/upload
Content-Type: multipart/form-data

FormData:
  file: <File>

Response:
{
  "ipfsUrl": "ipfs://QmXxx..."
}
```

### Upload Metadata
```bash
POST /api/ipfs/upload-metadata
Content-Type: application/json

Body:
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "ipfs://QmYyy...",
  "attributes": [
    { "trait_type": "Rarity", "value": "Legendary" }
  ]
}

Response:
{
  "ipfsUrl": "ipfs://QmZzz..."
}
```

## Minting Flow

1. **User uploads image** → Frontend sends to `/api/ipfs/upload`
2. **Backend uploads to Pinata** → Returns `ipfs://QmImageHash`
3. **Frontend creates metadata** → Includes image IPFS URL
4. **Metadata uploaded to IPFS** → Backend sends to `/api/ipfs/upload-metadata`
5. **Backend uploads to Pinata** → Returns `ipfs://QmMetadataHash`
6. **Smart contract mint** → `contract.mint(metadataHash, { value: 0.001 ETH })`
7. **NFT created on-chain** → TokenURI points to IPFS metadata

## Viewing IPFS Content

### IPFS Gateways
Convert `ipfs://QmXxx...` to HTTP URL using these gateways:
- https://ipfs.io/ipfs/QmXxx...
- https://gateway.pinata.cloud/ipfs/QmXxx...
- https://cloudflare-ipfs.com/ipfs/QmXxx...

### Example
If metadata is at `ipfs://QmABC123`, view it at:
```
https://ipfs.io/ipfs/QmABC123
```

## File Limits
- Maximum file size: 10 MB
- Supported formats: JPG, PNG, GIF, SVG, MP4, etc.
- Metadata: JSON format only

## Troubleshooting

### "Pinata API keys not configured"
- Verify secrets are added to Replit Secrets panel (🔒 icon)
- Restart the workflow after adding secrets
- Check server logs for environment variable loading

### Upload fails with 401/403
- Verify API keys are correct
- Ensure API key has correct permissions enabled
- Check Pinata dashboard for account limits

### IPFS content not loading
- Try different IPFS gateways (some may be slow)
- Wait a few minutes for content to propagate across IPFS network
- Verify CID is correct (starts with "Qm" for most files)

## Production Considerations
- **Rate Limits:** Free Pinata accounts have monthly limits
- **Redundancy:** Consider pinning important content to multiple services
- **Gateway Performance:** Use CDN or dedicated IPFS gateway for better UX
- **Cost:** Monitor Pinata usage and upgrade plan if needed
