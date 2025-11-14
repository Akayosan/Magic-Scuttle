#!/bin/bash
# Build script for Vercel deployment (frontend only)

echo "🏗️  Building Magic Scuttle Frontend for Vercel..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/client

# Build frontend using Vite with Vercel config
echo "📦 Building React application..."
npx vite build --config vite.config.vercel.ts

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo "📁 Output directory: dist/client"
    echo ""
    echo "Files ready for Vercel deployment:"
    ls -lh dist/client/
    echo ""
    echo "Total bundle size:"
    du -sh dist/client/
else
    echo "❌ Build failed!"
    exit 1
fi
