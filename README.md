# Scuttle Social 🔐

Privacy-preserving decentralized application (dApp) for token creation and presale using **Zama's fhEVM v0.9** (Fully Homomorphic Encryption).

<div align="center">

![Scuttle Social](https://img.shields.io/badge/Scuttle-Social-blue)
![fhEVM](https://img.shields.io/badge/fhEVM-v0.9-green)
![Sepolia](https://img.shields.io/badge/Network-Sepolia-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**Create tokens and run presales with complete privacy** ✨

[Features](#features) • [Quick Start](#quick-start) • [Deployment](#deployment) • [Architecture](#architecture)

</div>

---

## 🌟 Features

### Privacy-First Blockchain
- 🔒 **Encrypted Token Balances** - No one can see how many tokens you hold
- 🤐 **Encrypted Presale Contributions** - Keep your investment amounts private
- 🎭 **Optional Encrypted Total Supply** - Hide token supply from public view
- ⚡ **Zero-Knowledge Proofs** - Verify transactions without revealing amounts

### Token Creation
- Create custom ERC20 tokens with encrypted balances
- Support for 18 decimals (standard ERC20)
- Encrypted total supply option
- Instant deployment to Sepolia testnet

### Presale Management
- Launch privacy-preserving token presales
- Configurable hard cap, soft cap, contribution limits
- Automatic refunds if soft cap not reached
- Encrypted contribution tracking

### Beautiful UI/UX
- Modern, responsive design with dark mode
- Real-time wallet connection status
- Transaction status modals with progress indicators
- Privacy badges to show encryption status
- Loading states and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (LTS recommended)
- MetaMask browser extension
- Sepolia testnet ETH ([get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/scuttlecorp/Scuttle.git
cd Scuttle

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Connect Your Wallet
1. Open the app in your browser
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Switch to Sepolia testnet if prompted

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Sepolia

1. **Set environment variables**:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MNEMONIC=your twelve word phrase
ETHERSCAN_API_KEY=your_api_key
SESSION_SECRET=random_secret
```

2. **Fix Hardhat dependencies** (known issue):
```bash
npm install hardhat@^2.26.0 --save-dev
npm install fhevmjs
```

3. **Compile and deploy**:
```bash
npx hardhat compile
npx hardhat run scripts/deploy-all.ts --network sepolia
```

4. **Update contract addresses in frontend**

5. **Launch app**:
```bash
npm run dev
```

## 🏗️ Architecture

### Smart Contracts
```
contracts/
├── ConfidentialToken.sol      # Encrypted ERC20 (euint128 balances)
└── ConfidentialPresale.sol    # Encrypted presale contributions
```

**Key Features:**
- Uses Zama fhEVM v0.9 `euint128` for encrypted balances
- Supports standard 18-decimal ERC20 tokens
- Gateway integration for selective decryption
- Prevents overflow with 128-bit encrypted integers

### Frontend
```
client/src/
├── pages/           # React pages (CreateToken, ActivePresales, etc.)
├── components/      # Reusable UI components
├── hooks/           # Custom hooks (useWallet, useTokenContract)
├── lib/             # Utilities (fhevm, contracts, queryClient)
└── App.tsx          # Main app with routing
```

**Tech Stack:**
- React + TypeScript
- Ethers.js v6 for blockchain interactions
- fhevmjs for encrypted inputs
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling

### Backend
```
server/
├── routes.ts        # API endpoints
├── storage.ts       # In-memory data storage
└── index.ts         # Express server
```

**Features:**
- REST API for metadata storage
- Token and presale CRUD operations
- Zod schema validation
- Can be upgraded to PostgreSQL

## 🎨 UI Components

### Pages
- **Dashboard** - Overview of tokens and presales
- **Create Token** - Form to deploy new encrypted tokens
- **Create Presale** - Launch privacy-preserving presales
- **Active Presales** - Browse and contribute to ongoing presales
- **My Tokens** - Manage your created tokens

### Key Features
- Wallet connection indicator
- Network switcher (auto-switch to Sepolia)
- Privacy badges showing encryption status
- Transaction modals with progress
- Beautiful empty states
- Responsive design (mobile-friendly)

## 🔧 Development

### Project Structure
```
.
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment scripts
├── server/             # Express backend
├── client/             # React frontend
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Application pages
│       ├── hooks/      # Custom React hooks
│       └── lib/        # Utilities
├── shared/             # Shared TypeScript types
└── hardhat.config.ts   # Hardhat configuration
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npx hardhat compile  # Compile smart contracts
npx hardhat test     # Test smart contracts
```

## ⚠️ Known Issues

### Hardhat Dependency Conflict
**Issue:** Hardhat v3 vs v2 peer dependency conflict prevents:
- Smart contract compilation
- Installation of `fhevmjs` package
- Installation of `@octokit/rest` for GitHub sync

**Solution:**
```bash
npm install hardhat@^2.26.0 --save-dev
npm install fhevmjs @octokit/rest
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## 🔐 Security

- ✅ Encrypted balances using fhEVM euint128
- ✅ euint128 prevents overflow (supports up to 2^128-1)
- ✅ Zero-knowledge proofs for transfers
- ✅ No mnemonic in code (environment variables only)
- ⚠️ Testnet only - **NOT audited for mainnet**

**Important:** Get professional security audit before mainnet deployment.

## 📚 Learn More

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Sepolia Testnet](https://sepolia.dev/)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

<div align="center">

**Built with ❤️ using Zama fhEVM**

[Documentation](./DEPLOYMENT.md) • [Report Bug](https://github.com/scuttlecorp/Scuttle/issues) • [Request Feature](https://github.com/scuttlecorp/Scuttle/issues)

</div>
