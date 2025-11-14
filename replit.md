# Magic Scuttle - The First NFT and DeFi Marketplace with Fully Homomorphic Encryption

## Overview
Magic Scuttle is a full-stack decentralized application built to leverage Zama's fhEVM for privacy-preserving operations on the Sepolia testnet. Its primary purpose is to enable confidential DeFi activities, including NFT marketplace with listing/trading functionality, user profiles showing owned NFTs, collection creation, and NFT minting. The project aims to provide a secure and private environment for digital asset management, inspired by leading platforms like Magic Eden and OpenSea.

## Deployment Status
**Production URLs:**
- **Frontend (Vercel)**: https://magicscuttle-pan908j3r-akayosans-projects.vercel.app ✅ LIVE
- **Backend (Replit)**: https://magic-scuttle.replit.app ✅ RUNNING
- **GitHub Repository**: https://github.com/Akayosan/Magic-Scuttle

**Deployment Architecture:**
- Frontend deployed to Vercel CDN (global edge network)
- Backend API remains on Replit (Express.js + PostgreSQL)
- All `/api/*` calls from Vercel automatically proxied to Replit backend
- Smart contracts deployed to Sepolia testnet

## User Preferences
- **Coding Style:** TypeScript-first, functional where possible, comprehensive error handling
- **Design:** Magic Eden/OpenSea inspired - purple/pink gradients, dark theme, glassmorphism
- **Privacy-First:** All sensitive data (supply, contributions, rarity) encrypted using fhEVM euint128
- **Real Transactions:** All operations on Sepolia testnet (no mocks)

## System Architecture
The platform is a full-stack dApp utilizing Solidity smart contracts, a React/TypeScript frontend, and an Express.js/Node.js backend. All encrypted values within smart contracts utilize `euint128` for robust privacy.

**UI/UX Decisions:**
- The frontend is built with React, TypeScript, Vite, TailwindCSS, and shadcn/ui.
- Design aesthetics are inspired by Magic Eden and OpenSea, featuring purple/pink gradients, a dark theme, and glassmorphism effects.
- Branding: "Magic Scuttle" with tagline "The first NFT and DeFi marketplace with Fully Homomorphic Encryption🔒"
- Favicon uses scuttle-logo.jpg for consistent branding
- NFT Marketplace is the homepage (Dashboard removed)
- Navigation prioritizes NFT Marketplace, with Tokens & Presales marked as "Soon"
- Mint NFT page has encryption options disabled (display-only) to avoid errors - all minting is standard
- NFT listings appear in marketplace when listed for sale
- The application supports bilingual (Indonesian/English) content in key areas.

**Technical Implementations & Feature Specifications:**

**Smart Contracts:**
- **ConfidentialToken.sol:** ERC20 token with optional encrypted supply.
- **ConfidentialPresale.sol:** Enables privacy-preserving token presales with encrypted contributions.
- **ConfidentialERC721.sol:**
    - Extends OpenZeppelin ERC721, ERC721Royalty, and ReentrancyGuard.
    - Supports basic minting, minting with encrypted rarity, and minting with encrypted attributes.
    - Encrypted metadata (rarity, attributes) uses `euint128`.
    - Includes a decryption request system via Zama Gateway.
    - Implements EIP-2981 royalty support.
- **ConfidentialMarketplace.sol:**
    - Provides a full NFT escrow mechanism for listings, offers, and auctions.
    - Features a centralized payout system (`_calculatePayout` + `_executePayout`).
    - Incorporates `ReentrancyGuard` on all state-changing functions and safe ETH transfers.
    - Integrates EIP-2981 royalties and a configurable platform fee system.

**Security Features (Smart Contracts):**
- Reentrancy protection, safe ETH transfers, validated payout system, escrow tracking, royalty/fee capping, balance conservation, and zero address validation.

**Backend (Express.js/Node.js):**
- Manages API endpoints for tokens, presales, NFTs, listings, and bids.
- Provides data persistence via PostgreSQL.

**Frontend (React/TypeScript):**
- Integrates with deployed smart contracts for token and NFT operations.
- Handles wallet connections and `fhevmjs` integration for encrypted transactions.
- Manages IPFS uploads for NFT images and metadata via Pinata.
- Features a responsive dashboard with real-time statistics from backend APIs.
- Correctly initializes `fhevmjs` using the official Zama Gateway URL, proper WASM file paths (from `public` directory), and direct `window.ethereum` for the EIP-1193 provider.

**Database Schema (PostgreSQL):**
- **Token & Presale Tables:** `tokens`, `presales`, `contributions`.
- **NFT Tables (Planned):** `nft_collections`, `nft_items`, `nft_listings`, `nft_bids`, `nft_activity`.

## External Dependencies
- **Blockchain:** Sepolia Testnet
- **Encryption:** Zama's @zama-fhe/relayer-sdk v0.2.0+ (migrated from deprecated fhevmjs v0.6.2)
  - Uses `euint128` for all encrypted values in smart contracts
- **Smart Contract Development:** Hardhat, OpenZeppelin Contracts.
- **Frontend Frameworks:** React, Vite, TailwindCSS, shadcn/ui.
- **Backend Framework:** Express.js, Node.js.
- **Database:** PostgreSQL (via Replit's managed service).
- **IPFS Integration:** Pinata API for storing NFT images and metadata.
- **Blockchain RPC:** BlastAPI for Sepolia RPC.
- **Zama Services (FHEVM v0.9 Compatible):**
    - Zama Relayer: `https://relayer.testnet.zama.cloud` (OFFICIAL)
    - ACL Contract: `0x687820221192C5B662b25367F70076A37bc79b6c`
    - KMS Contract: `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC`
    - Input Verifier: `0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4`
    - Decryption Verifier: `0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1`
    - Input Verification Verifier: `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F`
    - Gateway Chain ID: 55815