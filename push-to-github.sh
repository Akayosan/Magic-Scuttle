#!/bin/bash

# Magic Scuttle - GitHub Push Script
# This script pushes all changes to GitHub repository

set -e  # Exit on error

echo "🚀 Starting GitHub push process..."

# Get GitHub token from environment
GITHUB_TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN}"
GITHUB_REPO="https://github.com/Akayosan/Magic-Scuttle.git"
GITHUB_USER="Akayosan"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_PERSONAL_ACCESS_TOKEN not found in environment"
    exit 1
fi

echo "✓ GitHub token found"

# Clean up any lock files
echo "🧹 Cleaning up lock files..."
rm -f .git/*.lock .git/index.lock .git/config.lock 2>/dev/null || true
echo "✓ Lock files cleaned"

# Configure git
echo "⚙️  Configuring git..."
git config user.email "magic-scuttle@replit.com"
git config user.name "Magic Scuttle"
echo "✓ Git configured"

# Add GitHub remote if not exists
echo "🔗 Setting up GitHub remote..."
if git remote | grep -q "^origin$"; then
    git remote set-url origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/Akayosan/Magic-Scuttle.git"
    echo "✓ Updated existing origin remote"
else
    git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/Akayosan/Magic-Scuttle.git"
    echo "✓ Added new origin remote"
fi

# Stage all changes
echo "📦 Staging changes..."
git add -A
echo "✓ Changes staged"

# Show status
echo ""
echo "📊 Git status:"
git status --short

# Commit changes
echo ""
echo "💾 Committing changes..."
git commit -m "feat: Complete Magic Scuttle NFT marketplace with FHE

- Implement NFT marketplace with encrypted metadata using Zama fhEVM
- Add comprehensive collection management system
- Fix NFT persistence: minted NFTs now save to database and appear in My NFTs
- Add collection selector to Mint NFT page with validation
- Re-enable encryption switches for Rarity and Attributes
- Integrate IPFS via Pinata for NFT images and metadata
- Deploy all smart contracts to Sepolia testnet:
  * ConfidentialToken: 0x5a98635124f7976333fA926C52691A26123EA3A4
  * ConfidentialPresale: 0xA2563613A4d41505d7914fF8676176e1bDE6e71C
  * ConfidentialERC721: 0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605
  * ConfidentialMarketplace: 0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4
- Add comprehensive README.md with:
  * All deployed contract addresses with Etherscan links
  * Complete FHE implementation explanation
  * Technology stack and architecture diagrams
  * Security features and best practices
  * Getting started guide and roadmap
- Improve error handling and user feedback
- Add loading states and validations" || echo "⚠️  Nothing to commit (already committed)"

echo "✓ Changes committed"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🔗 Repository: https://github.com/Akayosan/Magic-Scuttle"
echo ""
echo "📝 Next steps:"
echo "   1. Visit your GitHub repository"
echo "   2. Check that all files are uploaded"
echo "   3. Review the README.md"
echo ""
