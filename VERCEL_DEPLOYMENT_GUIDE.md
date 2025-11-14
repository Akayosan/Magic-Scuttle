# 🚀 Magic Scuttle - Vercel Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Vercel (Frontend)                   │
│  - React App                            │
│  - Static Assets                        │
│  - Smart Contract UI                    │
└──────────────┬──────────────────────────┘
               │
               │ API Calls
               ↓
┌─────────────────────────────────────────┐
│     Replit (Backend)                    │
│  - Express.js API                       │
│  - PostgreSQL Database                  │
│  - IPFS Integration                     │
└─────────────────────────────────────────┘
```

**Frontend (Vercel)**: Fast CDN delivery for React app  
**Backend (Replit)**: Full Express.js API with database

---

## 🎯 Quick Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to Vercel
vercel --prod

# 4. Follow prompts and enjoy!
```

### Method 2: Vercel Dashboard (Via GitHub)

1. **Push to GitHub first**
   - Make sure code is on GitHub: https://github.com/Akayosan/Magic-Scuttle

2. **Import to Vercel**
   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Select "Akayosan/Magic-Scuttle"
   - Click "Import"

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: vite build --outDir dist/client
   Output Directory: dist/client
   Install Command: npm install
   ```

4. **Add Environment Variables**
   
   Go to Project Settings → Environment Variables, add:
   
   ```
   VITE_API_URL=https://magic-scuttle.replit.app
   VITE_CONTRACT_TOKEN=0x5a98635124f7976333fA926C52691A26123EA3A4
   VITE_CONTRACT_PRESALE=0xA2563613A4d41505d7914fF8676176e1bDE6e71C
   VITE_CONTRACT_NFT=0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605
   VITE_CONTRACT_MARKETPLACE=0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4
   VITE_NETWORK=sepolia
   VITE_CHAIN_ID=11155111
   VITE_RELAYER_URL=https://relayer.testnet.zama.cloud
   VITE_GATEWAY_CHAIN_ID=55815
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site!

---

## 📋 Pre-Deployment Checklist

### ✅ Before Deploying

- [ ] GitHub repository is up to date
- [ ] Replit backend is deployed and running
- [ ] Environment variables ready (see `.env.vercel.example`)
- [ ] Smart contracts deployed to Sepolia
- [ ] All dependencies installed

### ✅ After Deploying

- [ ] Website loads correctly
- [ ] Wallet connection works
- [ ] NFT marketplace displays properly
- [ ] API calls to Replit backend working
- [ ] Smart contract interactions functional
- [ ] IPFS uploads working (via backend)

---

## 🔧 Configuration Files

### 1. `vercel.json`
```json
{
  "version": 2,
  "name": "magic-scuttle",
  "buildCommand": "vite build --outDir dist/client",
  "outputDirectory": "dist/client",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://magic-scuttle.replit.app/api/:path*"
    }
  ]
}
```

This configuration:
- Builds React app with Vite
- Outputs to `dist/client`
- Rewrites all `/api/*` calls to Replit backend
- Enables CORS headers

### 2. `.vercelignore`
Excludes unnecessary files from deployment:
- Backend files (`server/`)
- Smart contracts (`contracts/`)
- Database files
- Development tools

---

## 🌐 Environment Variables Setup

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://magic-scuttle.replit.app` | Backend API URL |
| `VITE_CONTRACT_TOKEN` | `0x5a98635124f7976333fA926C52691A26123EA3A4` | ConfidentialToken address |
| `VITE_CONTRACT_PRESALE` | `0xA2563613A4d41505d7914fF8676176e1bDE6e71C` | ConfidentialPresale address |
| `VITE_CONTRACT_NFT` | `0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605` | ConfidentialERC721 address |
| `VITE_CONTRACT_MARKETPLACE` | `0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4` | ConfidentialMarketplace address |
| `VITE_NETWORK` | `sepolia` | Ethereum network |
| `VITE_CHAIN_ID` | `11155111` | Sepolia chain ID |
| `VITE_RELAYER_URL` | `https://relayer.testnet.zama.cloud` | Zama relayer URL |
| `VITE_GATEWAY_CHAIN_ID` | `55815` | Zama gateway chain ID |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENABLE_ANALYTICS` | `false` | Enable analytics |
| `VITE_MAINTENANCE_MODE` | `false` | Maintenance mode |

---

## 🚀 Deployment Commands

### Build Locally (Test First)

```bash
# Build frontend only
npx vite build --outDir dist/client

# Or use the build script
chmod +x build-vercel.sh
./build-vercel.sh
```

### Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Update Deployment

```bash
# After making changes, redeploy
git push origin main  # Push to GitHub first
vercel --prod         # Then deploy to Vercel
```

---

## 🔍 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Solution: Install dependencies
npm install
```

**Error**: `Build command not found`
```bash
# Solution: Use correct build command
vite build --outDir dist/client
```

### API Calls Fail

**Error**: `CORS error` or `Network error`

**Solution**: Check Vercel configuration
- Ensure `vercel.json` has correct rewrite rules
- Verify Replit backend is running
- Check environment variable `VITE_API_URL`

### Smart Contract Errors

**Error**: `Contract not deployed` or `Invalid address`

**Solution**: Verify contract addresses
- Check all contract addresses in environment variables
- Ensure contracts are deployed to Sepolia
- Verify wallet is connected to Sepolia network

### Environment Variables Not Working

**Solution**: 
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Ensure all variables start with `VITE_`
4. Redeploy after adding variables

---

## 📊 Performance Optimization

### Vercel Edge Network

Vercel automatically:
- ✅ Serves assets from global CDN
- ✅ Compresses images and assets
- ✅ Minifies JavaScript and CSS
- ✅ Caches static files
- ✅ Enables HTTP/2

### Additional Optimizations

1. **Enable Vercel Analytics** (Optional)
   ```bash
   npm install @vercel/analytics
   ```

2. **Image Optimization**
   - Use WebP format
   - Lazy load images
   - Optimize file sizes

3. **Code Splitting**
   - Vite handles this automatically
   - Lazy load routes with React.lazy()

---

## 🎯 Custom Domain Setup

### Add Custom Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `magicscuttle.com`)
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. Vercel auto-provisions SSL certificate

---

## 🔐 Security Checklist

- [ ] All environment variables set correctly
- [ ] No sensitive data in frontend code
- [ ] CORS configured properly
- [ ] SSL certificate active (auto by Vercel)
- [ ] Smart contract addresses verified
- [ ] Backend API secured with proper authentication

---

## 📈 Monitoring & Analytics

### Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to client/src/main.tsx
import { Analytics } from '@vercel/analytics/react';

// In root component
<Analytics />
```

### Check Deployment Status

- **Deployments**: https://vercel.com/[username]/magic-scuttle/deployments
- **Analytics**: https://vercel.com/[username]/magic-scuttle/analytics
- **Logs**: https://vercel.com/[username]/magic-scuttle/logs

---

## 🆘 Support & Help

### Vercel Issues
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com/
- Support: https://vercel.com/support

### Magic Scuttle Issues
- GitHub: https://github.com/Akayosan/Magic-Scuttle/issues
- Replit Backend: Check Replit logs

---

## 📝 Deployment Checklist

### Pre-Deploy

- [ ] Code pushed to GitHub
- [ ] Replit backend running
- [ ] Environment variables prepared
- [ ] Build tested locally

### Deploy

- [ ] Run `vercel --prod`
- [ ] Add environment variables
- [ ] Verify build success
- [ ] Test deployed site

### Post-Deploy

- [ ] Check all pages load
- [ ] Test wallet connection
- [ ] Verify NFT marketplace
- [ ] Test smart contract interactions
- [ ] Confirm API calls work

---

## 🎉 Success!

After successful deployment:

1. **Frontend URL**: `https://magic-scuttle.vercel.app` (or your custom domain)
2. **Backend URL**: `https://magic-scuttle.replit.app`
3. **Repository**: `https://github.com/Akayosan/Magic-Scuttle`

Your Magic Scuttle NFT marketplace is now live on Vercel with:
- ⚡ Lightning-fast CDN delivery
- 🔒 Free SSL certificate
- 🌐 Global edge network
- 📊 Analytics (optional)
- 🎯 Custom domain support

---

**Built with ❤️ | Frontend on Vercel | Backend on Replit | Powered by Zama fhEVM**
