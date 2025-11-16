# 🔒 Magic Scuttle

**The First NFT and DeFi Marketplace with Fully Homomorphic Encryption**

Magic Scuttle is a revolutionary privacy-preserving decentralized application that leverages Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine) to bring confidential trading to the Sepolia testnet. Experience truly private NFT marketplace, token presales, and DeFi activities without compromising blockchain transparency.

<div align="center">

![Magic Scuttle](https://img.shields.io/badge/Magic-Scuttle-purple)
![FHE](https://img.shields.io/badge/FHE-Zama%20fhEVM%20v0.9-blue)
![Sepolia](https://img.shields.io/badge/Network-Sepolia-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-cyan)

**🎨 Trade NFTs • 💰 DeFi • 🔐 Complete Privacy**

[Features](#-features) • [Contracts](#-deployed-contracts) • [Quick Start](#-getting-started) • [Architecture](#-architecture) • [FHE](#-fhe-implementation)

</div>

---

## ✨ Features

### 🎨 NFT Marketplace with FHE

- **Confidential NFT Minting**: Create NFTs with encrypted rarity and attributes using `euint128`
- **Privacy-Preserving Trading**: List, buy, and trade NFTs while keeping sensitive metadata encrypted
- **Collection Management**: Create and manage NFT collections with EIP-2981 royalty support
- **Decryption Gateway**: Request selective decryption of encrypted attributes via Zama Gateway
- **IPFS Integration**: Decentralized storage for NFT images and metadata via Pinata
- **User Profiles**: Track your owned NFTs and trading history

### 💰 DeFi Features with FHE

- **Confidential Tokens**: ERC20 tokens with optional encrypted total supply
- **Private Presales**: Token presales with encrypted contribution amounts
- **Secure Trading**: All sensitive data protected by Fully Homomorphic Encryption
- **Fair Launch**: Privacy-preserving token distribution mechanisms

### 🏪 Advanced Marketplace Features

- **Escrow System**: Secure NFT marketplace with automated escrow and payout
- **Multiple Trading Types**: Fixed price sales, offers, and auctions
- **Royalty Support**: Automatic creator royalties on secondary sales (EIP-2981)
- **Platform Fees**: Configurable and transparent fee system
- **Real-time Analytics**: Track portfolio value and marketplace statistics

## 📜 Smart Contracts

### ConfidentialToken.sol
ERC20 token with optional encrypted total supply using Zama fhEVM.

**Key Features:**
- Standard ERC20 functionality with encrypted balances
- Optional encrypted total supply (`euint128`)
- Zero-knowledge transfer proofs
- Zama fhEVM v0.9 integration

**Contract Address:** [`0x5a98635124f7976333fA926C52691A26123EA3A4`](https://sepolia.etherscan.io/address/0x5a98635124f7976333fA926C52691A26123EA3A4)

### ConfidentialPresale.sol
Privacy-preserving token presale with encrypted contributions.

**Key Features:**
- Encrypted contribution tracking using `euint128`
- Fair launch mechanism with soft/hard caps
- Automated token distribution
- Refund support if soft cap not reached
- Privacy-first investment amounts

**Contract Address:** [`0xA2563613A4d41505d7914fF8676176e1bDE6e71C`](https://sepolia.etherscan.io/address/0xA2563613A4d41505d7914fF8676176e1bDE6e71C)

### ConfidentialERC721.sol
NFT contract with encrypted rarity and attributes.

**Key Features:**
- Standard ERC721 with extensions (ERC721Royalty, ReentrancyGuard)
- Three minting modes:
  1. **Basic Minting**: Standard NFTs without encryption
  2. **Encrypted Rarity**: NFTs with hidden rarity scores (`euint128`)
  3. **Encrypted Attributes**: NFTs with fully encrypted metadata (`euint128`)
- Decryption request system via Zama Gateway
- EIP-2981 royalty support (up to 10%)
- Secure minting with price controls (0.001 ETH)

**Contract Address:** [`0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605`](https://sepolia.etherscan.io/address/0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605)

### ConfidentialMarketplace.sol
Full-featured NFT marketplace with escrow and automated payouts.

**Key Features:**
- Complete escrow mechanism for secure NFT trading
- Support for fixed price sales, offers, and auctions
- Automated payout system with:
  - Creator royalties (EIP-2981, max 10%)
  - Platform fees (configurable, max 5%)
  - Seller proceeds
- Reentrancy protection on all state-changing functions
- Safe ETH transfers using `.call`
- Royalty and fee capping for user protection
- NFT locking during active listings

**Contract Address:** [`0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4`](https://sepolia.etherscan.io/address/0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4)

## 🌐 Deployed Contracts

### Magic Scuttle Contracts (Sepolia Testnet)

| Contract | Address | Etherscan | Purpose |
|----------|---------|-----------|---------|
| **ConfidentialToken** | `0x5a98635124f7976333fA926C52691A26123EA3A4` | [View →](https://sepolia.etherscan.io/address/0x5a98635124f7976333fA926C52691A26123EA3A4) | ERC20 with encrypted supply |
| **ConfidentialPresale** | `0xA2563613A4d41505d7914fF8676176e1bDE6e71C` | [View →](https://sepolia.etherscan.io/address/0xA2563613A4d41505d7914fF8676176e1bDE6e71C) | Private token presales |
| **ConfidentialERC721** | `0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605` | [View →](https://sepolia.etherscan.io/address/0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605) | NFTs with encrypted metadata |
| **ConfidentialMarketplace** | `0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4` | [View →](https://sepolia.etherscan.io/address/0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4) | NFT trading with escrow |

### Zama fhEVM System Contracts (Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| **ACL Contract** | `0x687820221192C5B662b25367F70076A37bc79b6c` | Access Control List for encrypted data |
| **KMS Contract** | `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC` | Key Management System |
| **Input Verifier** | `0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4` | Verifies encrypted inputs |
| **Decryption Verifier** | `0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1` | Verifies decryption requests |
| **Input Verification Verifier** | `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F` | Additional input verification |

**Zama Infrastructure:**
- **Relayer URL**: `https://relayer.testnet.zama.org`
- **Gateway Chain ID**: `55815`
- **fhEVM Version**: `0.9.x`
- **Network**: Sepolia Testnet (Chain ID: 11155111)

## 🛠 Technology Stack

### Smart Contracts
- **Solidity 0.8.24**: Smart contract development
- **Hardhat**: Development environment and testing
- **fhEVM 0.9**: Zama's Fully Homomorphic Encryption Virtual Machine
- **OpenZeppelin Contracts**: Secure, audited contract libraries
- **@zama-fhe/relayer-sdk v0.2.0+**: FHE integration for frontend

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Wouter**: Lightweight React routing
- **TanStack Query**: Powerful data fetching and caching
- **ethers.js v6**: Ethereum library for Web3 interactions

### Backend
- **Node.js + Express**: RESTful API server
- **PostgreSQL**: Relational database (Replit managed)
- **Drizzle ORM**: Type-safe database access
- **Zod**: Runtime schema validation
- **Pinata API**: IPFS pinning service

### Blockchain Infrastructure
- **Sepolia Testnet**: Ethereum test network
- **Zama fhEVM**: Fully Homomorphic Encryption infrastructure
- **IPFS**: Decentralized storage for NFT metadata

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia testnet ETH** ([Get from faucet](https://sepoliafaucet.com/))
- **Git** for cloning the repository



 **Install dependencies:**
```bash
npm install
```

 **Set up environment variables:**
```bash
# Create .env file with the following:
DATABASE_URL=your_postgres_url
SESSION_SECRET=your_session_secret
DEPLOYER_PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=your_rpc_url
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

**Start the development server:**
```bash
npm run dev
```

**Open the application:**
Navigate to `http://localhost:5000` in your browser

### Quick Start Guide

1. **Connect Wallet**: Click "Connect Wallet" in the top right and approve MetaMask
2. **Switch to Sepolia**: Confirm the network switch to Sepolia testnet
3. **Get Test ETH**: Use a [Sepolia faucet](https://sepoliafaucet.com/) to get test ETH
4. **Create Collection**: Navigate to "Create Collection" and set up your NFT collection
5. **Mint NFT**: Go to "Mint NFT", select your collection, upload an image, and mint
6. **View NFTs**: Check "My NFTs" to see your minted NFTs
7. **List for Sale**: Click on an NFT to view details and list it on the marketplace
8. **Browse Marketplace**: Explore the NFT marketplace to discover and purchase NFTs

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────┐
│           Frontend (React + TypeScript)         │
│  - NFT Marketplace UI                           │
│  - Wallet Integration                           │
│  - fhEVM SDK Integration                        │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ HTTP/REST API
┌─────────────────────────────────────────────────┐
│       Backend (Express.js + PostgreSQL)         │
│  - API Endpoints                                │
│  - Data Persistence                             │
│  - IPFS Integration (Pinata)                    │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ Web3 (ethers.js)
┌─────────────────────────────────────────────────┐
│         Sepolia Testnet + fhEVM                 │
│  - Smart Contracts                              │
│  - FHE Operations (euint128)                    │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ Encrypted Operations
┌─────────────────────────────────────────────────┐
│        Zama Gateway + Relayer                   │
│  - Encryption/Decryption                        │
│  - Key Management                               │
│  - FHE Computation                              │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → React components with shadcn/ui
2. **State Management** → TanStack Query for server state
3. **API Layer** → Express.js RESTful endpoints
4. **Blockchain** → ethers.js + fhEVM SDK for smart contract calls
5. **FHE Operations** → Zama Relayer for encrypted computations
6. **Storage** → PostgreSQL for metadata, IPFS for images
7. **Wallet** → MetaMask for transaction signing

### Database Schema

- **nft_collections**: Collection metadata, royalties, statistics
- **nft_items**: Individual NFTs with ownership, metadata, encryption flags
- **nft_listings**: Active marketplace listings with prices
- **nft_bids**: Offers on NFTs
- **tokens**: Token information
- **presales**: Presale configurations
- **contributions**: Presale participant data

## 🔐 FHE Implementation

### What is Fully Homomorphic Encryption?

Fully Homomorphic Encryption (FHE) allows computations on encrypted data **without decrypting it**. In Magic Scuttle, this revolutionary technology enables:

- **🎨 NFT Rarity**: Keep rarity scores hidden until reveal time
- **💎 Token Supply**: Hide total supply from public view
- **💰 Presale Contributions**: Private investment amounts
- **🏷️ NFT Attributes**: Encrypted metadata that only owners can decrypt

### How FHE Works in Magic Scuttle

```solidity
// Example: Minting NFT with encrypted rarity
function mintWithEncryptedRarity(
    address to,
    string memory tokenURI,
    bytes calldata encryptedRarity
) public payable {
    require(msg.value >= MINT_PRICE, "Insufficient payment");
    
    // Verify and store encrypted rarity
    euint128 _rarity = TFHE.asEuint128(encryptedRarity, msg.sender);
    
    uint256 tokenId = _tokenIdCounter++;
    _encryptedRarity[tokenId] = _rarity;
    _hasEncryptedRarity[tokenId] = true;
    
    // Mint NFT with encrypted metadata
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, tokenURI);
}
```

### Encryption Types

All encrypted values use **`euint128`** (128-bit unsigned encrypted integer):
- **Range**: 0 to 2^128 - 1
- **Use Cases**: Rarity scores, token supply, contribution amounts
- **Optimized**: For FHE operations on Zama fhEVM
- **Privacy**: Computations without decryption

### Decryption Flow

1. **Request Decryption**: User initiates decryption via frontend
2. **Smart Contract**: Emits `DecryptionRequested` event to Zama Gateway
3. **Zama Gateway**: Processes decryption request securely
4. **Callback**: Gateway calls contract's callback function with decrypted value
5. **Result**: Frontend displays decrypted data to authorized user

### FHE Benefits

- ✅ **Privacy**: Sensitive data remains encrypted on-chain
- ✅ **Computation**: Perform operations on encrypted data
- ✅ **Selective Disclosure**: Decrypt only when needed
- ✅ **Trust**: No need to trust third parties
- ✅ **Compliance**: Meet privacy regulations

## 🛡 Security Features

### Smart Contract Security

- ✅ **Reentrancy Protection**: All state-changing functions use `ReentrancyGuard`
- ✅ **Safe ETH Transfers**: Using `.call{value}` with proper error handling
- ✅ **Input Validation**: Comprehensive checks on all function inputs
- ✅ **Access Control**: Owner-only functions properly restricted
- ✅ **Overflow Protection**: Solidity 0.8+ built-in overflow/underflow checks
- ✅ **Escrow System**: NFTs locked in contract during trading
- ✅ **Fee Capping**: Royalties capped at 10%, platform fees at 5%
- ✅ **Zero Address Checks**: Prevent transfers to zero address

### Application Security

- ✅ **Environment Variables**: All secrets stored in env vars
- ✅ **Database Security**: PostgreSQL with proper access control
- ✅ **Session Management**: Secure session handling with express-session
- ✅ **HTTPS**: Encrypted communication (production)
- ✅ **Input Sanitization**: Zod schema validation on all API endpoints
- ✅ **CORS**: Configured for secure cross-origin requests

### FHE Security

- ✅ **Encrypted Storage**: Sensitive data encrypted with `euint128`
- ✅ **Key Management**: Zama KMS handles encryption keys
- ✅ **Access Control**: ACL contract manages data access
- ✅ **Verified Inputs**: Input verifier validates encrypted data
- ✅ **Secure Decryption**: Decryption verifier ensures authorized access

## 🎨 Design Philosophy

Inspired by **Magic Eden** and **OpenSea**, Magic Scuttle features a premium design:

- **🎨 Purple/Pink Gradients**: Modern, eye-catching color scheme
- **🌙 Dark Theme**: Professional dark mode optimized for long sessions
- **✨ Glassmorphism**: Frosted glass effects for visual depth
- **📱 Responsive Design**: Perfect on desktop, tablet, and mobile
- **🎬 Smooth Animations**: Delightful micro-interactions
- **♿ Accessibility**: WCAG compliant for all users

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

Please ensure:
- Code follows the project's TypeScript conventions
- All tests pass
- New features include appropriate tests
- Documentation is updated

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Zama](https://www.zama.ai/)** for the groundbreaking fhEVM technology
- **[OpenZeppelin](https://www.openzeppelin.com/)** for secure smart contract libraries
- **[Pinata](https://www.pinata.cloud/)** for reliable IPFS infrastructure
- **The Ethereum Community** for continuous innovation in Web3

## 📞 Contact & Support

- **GitHub**: [@Akayosan](https://github.com/Akayosan)
- **Repository**: [Magic-Scuttle](https://github.com/Akayosan/Magic-Scuttle)
- **Issues**: [Report bugs or request features](https://github.com/Akayosan/Magic-Scuttle/issues)

## 🗺 Roadmap

### ✅ Completed
- [x] NFT Marketplace with FHE
- [x] Collection Management System
- [x] Token & Presale System
- [x] IPFS Integration
- [x] User Profiles
- [x] Escrow & Trading System

### 🚧 In Progress
- [ ] Advanced Trading (Auctions, Bundles)
- [ ] NFT Analytics Dashboard
- [ ] Enhanced Privacy Features

### 📅 Planned
- [ ] Mobile App (React Native)
- [ ] Mainnet Deployment
- [ ] Cross-chain Support (Polygon, Arbitrum)
- [ ] DAO Governance System
- [ ] NFT Staking & Rewards
- [ ] Social Features (Profiles, Following)

---

<div align="center">

**Built with ❤️ using Zama fhEVM**

*Securing Privacy in Web3 | Making NFTs Truly Private*

[Documentation](./replit.md) • [Report Bug](https://github.com/Akayosan/Magic-Scuttle/issues) • [Request Feature](https://github.com/Akayosan/Magic-Scuttle/issues)

</div>
