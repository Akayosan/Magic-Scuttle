# Scuttle - Privacy-Preserving DeFi Platform

## Overview
Scuttle is a full-stack decentralized application built to leverage Zama's fhEVM for privacy-preserving operations on the Sepolia testnet. Its primary purpose is to enable confidential DeFi activities, including the creation of ERC20 tokens with encrypted supply, privacy-preserving presales, and a feature-rich NFT marketplace supporting encrypted rarity and attributes. The project aims to provide a secure and private environment for digital asset management, inspired by leading platforms like Magic Eden and OpenSea.

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
- The Dashboard includes a featured NFT slider with Embla Carousel, displaying top recent NFTs with IPFS image display and encrypted NFT badges.
- Navigation is reorganized to prioritize the NFT Marketplace, with Tokens & Presales marked as "Soon."
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
- **Encryption:** Zama's fhevm.js library for fhEVM v0.9 (utilizing `euint128` for all encrypted values).
- **Smart Contract Development:** Hardhat, OpenZeppelin Contracts.
- **Frontend Frameworks:** React, Vite, TailwindCSS, shadcn/ui.
- **Backend Framework:** Express.js, Node.js.
- **Database:** PostgreSQL (via Replit's managed service).
- **IPFS Integration:** Pinata API for storing NFT images and metadata.
- **Blockchain RPC:** BlastAPI for Sepolia RPC.
- **Zama Services:**
    - Zama Gateway: `https://gateway.sepolia.zama.ai/`
    - Zama Relayer: `https://relayer.testnet.zama.cloud` (distinct from Gateway)
    - ACL Contract: `0x687820221192C5B662b25367F70076A37bc79b6c`
    - KMS Contract: `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC`