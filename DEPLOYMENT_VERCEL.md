# Deploying Magic Scuttle to Vercel

## ⚠️ Important Notice

Magic Scuttle is a **full-stack application** with:
- Express.js backend API
- PostgreSQL database
- React frontend
- Smart contract interactions

**Vercel is optimized for frontend/serverless** - deploying full-stack apps requires splitting architecture.

## 🎯 Recommended Approach: Split Deployment

### Architecture Split

```
Frontend (Vercel)          Backend (Railway/Render)
├── React App              ├── Express.js API
├── Static Assets          ├── PostgreSQL Database
└── Smart Contract UI      └── IPFS Integration
```

---

## 📋 Option 1: Frontend Only on Vercel (Recommended)

Deploy only the frontend to Vercel, keep backend on Replit or move to Railway/Render.

### Step 1: Build Frontend Only

```bash
# Build frontend
npm run build

# This creates dist/client folder
```

### Step 2: Configure Vercel

Create `vercel.json`:
```json
{
  "version": 2,
  "name": "magic-scuttle",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-url.com"
  }
}
```

### Step 3: Deploy Backend Separately

**Option A: Keep on Replit**
- Use Replit deployment for backend
- Get the deployment URL
- Set as `VITE_API_URL` in Vercel

**Option B: Deploy to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option C: Deploy to Render**
- Create account at render.com
- Connect GitHub repository
- Create new Web Service
- Deploy Express.js backend

### Step 4: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 5: Configure Environment Variables

In Vercel Dashboard, add:
```
VITE_API_URL=https://your-backend-url.com
VITE_CONTRACT_TOKEN=0x5a98635124f7976333fA926C52691A26123EA3A4
VITE_CONTRACT_PRESALE=0xA2563613A4d41505d7914fF8676176e1bDE6e71C
VITE_CONTRACT_NFT=0xeC4Aae6cf695110DA2a4De78F5018bB9d9d3D605
VITE_CONTRACT_MARKETPLACE=0xcb5593D3dF2d92ba2B723BFDcCB6e04482fE5aA4
```

---

## 📋 Option 2: Full-Stack on Vercel (Advanced)

Convert Express.js to Vercel Serverless Functions.

### Step 1: Restructure Backend

Move API routes to `api/` folder:

```
api/
├── nft/
│   ├── collections.ts
│   ├── items.ts
│   └── listings.ts
├── tokens.ts
└── presales.ts
```

### Step 2: Convert Express Routes to Serverless

Example: `api/nft/collections.ts`
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = neon(process.env.DATABASE_URL!);
  
  if (req.method === 'GET') {
    const collections = await sql`SELECT * FROM nft_collections`;
    return res.json(collections);
  }
  
  if (req.method === 'POST') {
    const { name, symbol, contractAddress } = req.body;
    const result = await sql`
      INSERT INTO nft_collections (name, symbol, contract_address)
      VALUES (${name}, ${symbol}, ${contractAddress})
      RETURNING *
    `;
    return res.json(result[0]);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Step 3: Setup Database

**Option A: Vercel Postgres**
```bash
vercel postgres create
```

**Option B: Neon Database** (Recommended)
- Visit neon.tech
- Create free database
- Get connection string
- Add to Vercel env vars

### Step 4: Update `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/client"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🎯 Comparison: Replit vs Vercel

| Feature | Replit Deployment | Vercel |
|---------|------------------|---------|
| **Setup** | ⭐⭐⭐⭐⭐ One-click | ⭐⭐ Complex |
| **Full-Stack** | ✅ Native support | ❌ Needs split |
| **Database** | ✅ Included | ❌ External setup |
| **Backend** | ✅ Express.js works | ⚠️ Serverless only |
| **Cost** | 💰 Included | 💰 Hobby free, then paid |
| **Performance** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent CDN |
| **SSL/HTTPS** | ✅ Auto | ✅ Auto |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **WebSocket** | ✅ Yes | ⚠️ Limited |

---

## 🚀 Recommended Deployment Strategy

### For Magic Scuttle:

1. **Best Choice: Replit Deployment** ⭐
   - Click "Deploy" button in Replit
   - Zero configuration needed
   - Database already connected
   - Perfect for full-stack apps

2. **Alternative: Hybrid Deployment**
   - Frontend → Vercel (fast CDN)
   - Backend → Railway/Render (full Express.js support)
   - Database → Neon (managed PostgreSQL)

3. **Advanced: Full Vercel**
   - Convert all routes to serverless functions
   - Use Vercel Postgres or Neon
   - More complex but better performance

---

## 📝 Quick Deploy Commands

### Replit (Easiest)
```bash
# Just click the "Deploy" button in Replit UI!
# That's it! 🎉
```

### Vercel Frontend Only
```bash
vercel --prod
```

### Vercel Full-Stack
```bash
# 1. Convert routes to serverless
# 2. Setup Neon database
# 3. Configure vercel.json
# 4. Deploy
vercel --prod
```

---

## 🆘 Need Help?

- **Replit Deployment**: Check Replit docs or use built-in deploy button
- **Vercel Issues**: Visit vercel.com/docs
- **Database Setup**: Visit neon.tech or railway.app

---

**Recommendation**: Use **Replit Deployment** for Magic Scuttle because it's full-stack ready and requires zero configuration! ✨
