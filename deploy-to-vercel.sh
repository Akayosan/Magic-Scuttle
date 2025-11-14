#!/bin/bash
# Quick deploy Magic Scuttle to Vercel

echo "🚀 Magic Scuttle - Vercel Deployment Script"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI"
        echo "Please install manually: npm install -g vercel"
        exit 1
    fi
fi

# Build frontend
echo "🏗️  Step 1: Building frontend..."
./build-vercel.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

# Check if user is logged in to Vercel
echo "🔐 Step 2: Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please login..."
    vercel login
    
    if [ $? -ne 0 ]; then
        echo "❌ Login failed!"
        exit 1
    fi
fi

echo "✅ Authenticated with Vercel"
echo ""

# Deploy to Vercel
echo "🚀 Step 3: Deploying to Vercel..."
echo ""
echo "Important notes:"
echo "- This will deploy the frontend to Vercel"
echo "- Backend API remains on Replit"
echo "- API calls will be proxied to: https://magic-scuttle.replit.app"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Deploy to production
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment successful!"
        echo ""
        echo "Next steps:"
        echo "1. Visit Vercel dashboard to see your deployment"
        echo "2. Add environment variables (see .env.vercel.example)"
        echo "3. Test your deployed application"
        echo ""
        echo "Environment variables to add in Vercel:"
        echo "  VITE_API_URL=https://magic-scuttle.replit.app"
        echo "  VITE_CONTRACT_TOKEN=0x5a98635124f7976333fA926C52691A26123EA3A4"
        echo "  VITE_CONTRACT_PRESALE=0xA2563613A4d41505d7914fF8676176e1bDE6e71C"
        echo "  VITE_CONTRACT_NFT=0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605"
        echo "  VITE_CONTRACT_MARKETPLACE=0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4"
        echo "  VITE_NETWORK=sepolia"
        echo "  VITE_CHAIN_ID=11155111"
        echo "  VITE_RELAYER_URL=https://relayer.testnet.zama.cloud"
        echo "  VITE_GATEWAY_CHAIN_ID=55815"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "Deployment cancelled."
    exit 0
fi
