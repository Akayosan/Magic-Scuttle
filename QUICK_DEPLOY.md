# 🚀 Magic Scuttle - Quick Deploy to Vercel

## ⚡ Fastest Way to Deploy (1 Command)

```bash
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

This script will:
1. ✅ Install Vercel CLI if needed
2. ✅ Build your frontend
3. ✅ Login to Vercel
4. ✅ Deploy to production
5. ✅ Show you next steps

---

## 📋 Manual Deploy Steps

### 1️⃣ Install Vercel CLI

```bash
npm install -g vercel
```

### 2️⃣ Build Frontend

```bash
chmod +x build-vercel.sh
./build-vercel.sh
```

### 3️⃣ Login to Vercel

```bash
vercel login
```

### 4️⃣ Deploy

```bash
vercel --prod
```

---

## 🔧 After Deployment

### Add Environment Variables in Vercel Dashboard

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```env
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

4. Click **Save**
5. **Redeploy** your application

---

## 🌐 Alternative: Deploy via GitHub

### 1️⃣ Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2️⃣ Import to Vercel

1. Visit https://vercel.com/new
2. Click **Import Git Repository**
3. Select `Akayosan/Magic-Scuttle`
4. Configure settings:
   - **Framework**: Vite
   - **Build Command**: `npx vite build --config vite.config.vercel.ts`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install`

### 3️⃣ Add Environment Variables

Same as above - add all VITE_* variables

### 4️⃣ Deploy

Click **Deploy** and wait!

---

## ✅ Verify Deployment

After deployment, test these features:

- [ ] Website loads correctly
- [ ] Wallet connection works (MetaMask)
- [ ] NFT Marketplace displays NFTs
- [ ] API calls work (check browser console)
- [ ] Minting NFT works
- [ ] Creating collections works
- [ ] Listings work

---

## 🔍 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
npm install
./build-vercel.sh
```

### API Calls Fail

**Error**: `Network error` or `CORS error`

**Solution**: 
1. Verify Replit backend is running
2. Check `VITE_API_URL` in Vercel environment variables
3. Ensure it points to: `https://magic-scuttle.replit.app`

### Wallet Connection Issues

**Error**: `Contract not found`

**Solution**:
1. Check all contract addresses in environment variables
2. Ensure wallet is on Sepolia network
3. Verify contracts are deployed

---

## 📊 Deployment Checklist

### Before Deploy

- [x] Frontend builds successfully
- [x] Replit backend is running
- [x] Smart contracts deployed to Sepolia
- [x] Environment variables prepared

### After Deploy

- [ ] Add all environment variables in Vercel
- [ ] Redeploy after adding env vars
- [ ] Test wallet connection
- [ ] Test NFT minting
- [ ] Test marketplace features
- [ ] Verify API calls work

---

## 🎯 Important Notes

### Backend Stays on Replit

- ✅ Express.js API: `https://magic-scuttle.replit.app`
- ✅ PostgreSQL database on Replit
- ✅ IPFS Pinata integration on Replit

### Frontend on Vercel

- ✅ React app: `https://magic-scuttle.vercel.app` (or custom domain)
- ✅ Static assets on Vercel CDN
- ✅ API calls proxied to Replit

### API Routing

All `/api/*` calls from Vercel frontend are automatically routed to:
```
https://magic-scuttle.replit.app/api/*
```

This is configured in `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://magic-scuttle.replit.app/api/:path*"
    }
  ]
}
```

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Deployment Guide**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Vercel Status**: https://www.vercel-status.com/

---

## 🎉 Success!

Your Magic Scuttle NFT marketplace is now deployed on:

- **Frontend**: Vercel (Fast CDN)
- **Backend**: Replit (Full-stack support)
- **Blockchain**: Sepolia Testnet
- **Encryption**: Zama fhEVM

**Next Steps:**
1. Share your Vercel URL with users
2. Optionally add a custom domain
3. Monitor analytics in Vercel dashboard
4. Keep backend running on Replit

---

**Built with ❤️ | Powered by Zama fhEVM | Deployed on Vercel + Replit**
