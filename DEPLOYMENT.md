# Scuttle Social - Deployment Guide

## Overview
Scuttle Social is a privacy-preserving decentralized application (dApp) for token creation and presale using Zama's fhEVM (Fully Homomorphic Encryption) protocol v0.9.

## Current Status

### ✅ Completed
1. **Frontend** - Production-ready React application with:
   - Wallet connection (MetaMask)
   - Token creation form with encrypted parameter toggles
   - Presale creation form
   - Active presales list
   - Token details view
   - Presale participation interface
   - Transaction status modals
   - Privacy indicators
   - Beautiful loading/error/empty states

2. **Smart Contracts** - Zama fhEVM v0.9 contracts:
   - `ConfidentialToken.sol` - Privacy-preserving ERC20 with encrypted balances using euint128
   - `ConfidentialPresale.sol` - Encrypted presale contributions using euint128
   - Both contracts support 18-decimal tokens (standard ERC20)

3. **Backend** - Express API with:
   - REST API routes for tokens, presales, contributions
   - In-memory storage with full CRUD operations
   - Zod schema validation

4. **Integration Hooks** - React hooks for:
   - Wallet connection (`useWallet`)
   - Token contract interactions (`useTokenContract`)
   - Presale contract interactions (`usePresaleContract`)
   - fhEVM instance initialization
   - Contract ABIs defined

### ⚠️ Known Issues

#### 1. Hardhat Dependency Conflict
**Problem:** Hardhat v3.0.13 is installed but @nomicfoundation/hardhat-toolbox@6.1.0 requires Hardhat v2.26.0

**Impact:**
- Cannot compile smart contracts with `npx hardhat compile`
- Cannot install `fhevmjs` package (required for frontend encrypted inputs)
- Cannot install `@octokit/rest` (required for GitHub auto-sync)

**Workaround:**
- Smart contracts are written and ready
- Deploy contracts using a separate Hardhat v2 environment
- Frontend ABIs are manually defined in `client/src/lib/contracts.ts`

**Solution (for production):**
Either downgrade Hardhat to v2.x:
```bash
npm install hardhat@^2.26.0 --save-dev
npm install fhevmjs @octokit/rest
```

Or use `--legacy-peer-deps` for all installs (not recommended).

#### 2. Node.js Version Incompatibility
**Problem:** Node.js 20.19.3 is not supported by Hardhat. Requires Node.js 22.10.0+

**Solution:**
Upgrade to Node.js 22 LTS:
```bash
nvm install 22
nvm use 22
```

## Deployment to Sepolia Testnet

### Prerequisites
1. MetaMask wallet with Sepolia ETH
2. Sepolia RPC URL (e.g., from Infura)
3. Mnemonic phrase for deployment account
4. Etherscan API key for contract verification

### Step 1: Set Environment Variables

Create a `.env` file in the project root:

```env
# Sepolia Network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MNEMONIC=your twelve word mnemonic phrase here

# Etherscan for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Session secret for backend
SESSION_SECRET=your_random_session_secret

# Optional: GitHub integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=scuttlecorp
GITHUB_REPO=Scuttle
```

### Step 2: Fix Hardhat Dependencies

```bash
# Option 1: Downgrade Hardhat (recommended)
npm install hardhat@^2.26.0 --save-dev

# Option 2: Remove conflicting packages and reinstall
npm uninstall @nomicfoundation/hardhat-toolbox
npm install hardhat@^2.26.0 @nomicfoundation/hardhat-toolbox@^2.0.0
```

### Step 3: Install fhEVM Dependencies

```bash
# Install fhEVM packages
npm install fhevm fhevm-core-contracts
npm install fhevmjs  # For frontend encrypted inputs
```

### Step 4: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 2 Solidity files successfully
```

### Step 5: Deploy Contracts

Deploy all contracts (Token + Presale):
```bash
npx hardhat run scripts/deploy-all.ts --network sepolia
```

Or deploy individually:
```bash
# Deploy token only
npx hardhat run scripts/deploy-token.ts --network sepolia

# Deploy presale (requires TOKEN_ADDRESS env var)
export TOKEN_ADDRESS=0x...
npx hardhat run scripts/deploy-presale.ts --network sepolia
```

The deployment script will:
- Deploy ConfidentialToken with 1M supply, 18 decimals, encrypted
- Deploy ConfidentialPresale with 7-day duration
- Save deployment info to `deployments/sepolia-{timestamp}.json`
- Print verification commands

### Step 6: Verify Contracts on Etherscan

```bash
# Verify token
npx hardhat verify --network sepolia TOKEN_ADDRESS "Scuttle Token" "SCT" 18 1000000000000000000000000 true

# Verify presale
npx hardhat verify --network sepolia PRESALE_ADDRESS \
  TOKEN_ADDRESS \
  1000000000000000000000 \
  100000000000000000000 \
  10000000000000000000 \
  10000000000000000 \
  10000000000000000000 \
  START_TIME \
  END_TIME \
  true
```

### Step 7: Update Frontend with Contract Addresses

Update `client/src/config/contracts.ts` (create if doesn't exist):

```typescript
export const CONTRACTS = {
  sepolia: {
    token: "0xYOUR_TOKEN_ADDRESS",
    presale: "0xYOUR_PRESALE_ADDRESS",
  },
};
```

### Step 8: Start Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Testing

### Manual Testing
1. Connect MetaMask to Sepolia
2. Ensure you have test ETH (get from faucet: https://sepoliafaucet.com/)
3. Create a token with encrypted supply
4. Create a presale for your token
5. Contribute to the presale
6. Test claiming tokens after presale ends

### End-to-End Testing
```bash
npm run test
```

## GitHub Integration

### Auto-Sync Setup
Once `@octokit/rest` is installed, the backend will automatically sync code changes to the scuttlecorp/Scuttle repository.

Update `server/github-sync.ts` with your GitHub token:
```typescript
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
```

## Production Deployment

### Using Replit
The app is already configured for Replit deployment. Simply:
1. Set environment variables in Replit Secrets
2. Click "Deploy" to publish

### Using Other Platforms
Build the production bundle:
```bash
npm run build
npm start
```

## Security Notes

1. **Never commit `.env` file** - Contains sensitive keys
2. **Use hardware wallet for mainnet** - Never use mnemonic in production
3. **Audit contracts** - Get professional audit before mainnet deployment
4. **Test thoroughly** - Encrypted operations are irreversible
5. **Monitor gas costs** - fhEVM operations are more expensive than regular ERC20

## Architecture

### Smart Contracts
- **ConfidentialToken.sol** - Implements encrypted ERC20 using euint128 for balances
- **ConfidentialPresale.sol** - Privacy-preserving presale with encrypted contributions

### Frontend
- **React + TypeScript** - Modern UI with Shadcn components
- **Ethers.js v6** - Blockchain interactions
- **fhevmjs** - Create encrypted inputs for smart contracts
- **TanStack Query** - Data fetching and caching
- **Wouter** - Client-side routing

### Backend
- **Express.js** - REST API server
- **In-memory storage** - Can be upgraded to PostgreSQL
- **Zod validation** - Type-safe request validation

## Troubleshooting

### "Cannot find module 'fhevmjs'"
Run: `npm install fhevmjs` (after fixing Hardhat dependency)

### "Network not supported"
Ensure MetaMask is connected to Sepolia testnet

### "Insufficient funds"
Get test ETH from Sepolia faucet

### "Transaction failed"
Check:
- Contract addresses are correct
- You're on Sepolia network
- You have enough gas
- Presale is active (if contributing)

## Support

For issues or questions:
1. Check GitHub Issues: https://github.com/scuttlecorp/Scuttle
2. Zama fhEVM Docs: https://docs.zama.ai/fhevm
3. Hardhat Docs: https://hardhat.org/

## License

MIT
