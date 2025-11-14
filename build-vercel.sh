#!/bin/bash
# Build script for Vercel deployment (frontend only)

echo "🏗️  Building Magic Scuttle Frontend for Vercel..."

# Build frontend using Vite
echo "📦 Building React application..."
npx vite build --outDir dist/client

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo "📁 Output directory: dist/client"
    echo ""
    echo "Files ready for Vercel deployment:"
    ls -lh dist/client/
else
    echo "❌ Build failed!"
    exit 1
fi
