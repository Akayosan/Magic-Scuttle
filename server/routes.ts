import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTokenSchema, 
  insertPresaleSchema, 
  insertContributionSchema,
  insertNFTCollectionSchema,
  insertNFTItemSchema,
  insertNFTListingSchema,
  insertNFTBidSchema,
  insertNFTActivitySchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

async function uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured");
  }

  const formData = new FormData();
  formData.append('file', fileBuffer, fileName);
  
  const pinataMetadata = JSON.stringify({ name: fileName });
  formData.append('pinataMetadata', pinataMetadata);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
      ...formData.getHeaders()
    },
    body: formData as any
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data = await response.json() as { IpfsHash: string };
  return `ipfs://${data.IpfsHash}`;
}

async function uploadJSONToIPFS(metadata: any): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured");
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    throw new Error(`Pinata JSON upload failed: ${response.statusText}`);
  }

  const data = await response.json() as { IpfsHash: string };
  return `ipfs://${data.IpfsHash}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // IPFS upload endpoint
  app.post("/api/ipfs/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const ipfsUrl = await uploadToIPFS(req.file.buffer, req.file.originalname);
      res.json({ ipfsUrl });
    } catch (error: any) {
      console.error("IPFS upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload to IPFS" });
    }
  });

  app.post("/api/ipfs/upload-metadata", async (req, res) => {
    try {
      const metadata = req.body;
      if (!metadata) {
        res.status(400).json({ error: "No metadata provided" });
        return;
      }

      const ipfsUrl = await uploadJSONToIPFS(metadata);
      res.json({ ipfsUrl });
    } catch (error: any) {
      console.error("IPFS metadata upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload metadata to IPFS" });
    }
  });

  // Token routes
  
  // Create a new token
  app.post("/api/tokens", async (req, res) => {
    try {
      const validatedData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken(validatedData);
      res.json(token);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create token" });
      }
    }
  });

  // Get all tokens
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  // Get token by ID
  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.getToken(req.params.id);
      if (!token) {
        res.status(404).json({ error: "Token not found" });
        return;
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token" });
    }
  });

  // Get token by contract address
  app.get("/api/tokens/by-address/:address", async (req, res) => {
    try {
      const token = await storage.getTokenByAddress(req.params.address);
      if (!token) {
        res.status(404).json({ error: "Token not found" });
        return;
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token" });
    }
  });

  // Get tokens by creator
  app.get("/api/tokens/by-creator/:creator", async (req, res) => {
    try {
      const tokens = await storage.getTokensByCreator(req.params.creator);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  // Update token
  app.patch("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.updateToken(req.params.id, req.body);
      if (!token) {
        res.status(404).json({ error: "Token not found" });
        return;
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to update token" });
    }
  });

  // Delete token
  app.delete("/api/tokens/:id", async (req, res) => {
    try {
      const success = await storage.deleteToken(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Token not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete token" });
    }
  });

  // Presale routes
  
  // Create a new presale
  app.post("/api/presales", async (req, res) => {
    try {
      const validatedData = insertPresaleSchema.parse(req.body);
      const presale = await storage.createPresale(validatedData);
      res.json(presale);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create presale" });
      }
    }
  });

  // Get all presales
  app.get("/api/presales", async (req, res) => {
    try {
      const presales = await storage.getAllPresales();
      res.json(presales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presales" });
    }
  });

  // Get active presales
  app.get("/api/presales/active", async (req, res) => {
    try {
      const presales = await storage.getActivePresales();
      res.json(presales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active presales" });
    }
  });

  // Get presale by ID
  app.get("/api/presales/:id", async (req, res) => {
    try {
      const presale = await storage.getPresale(req.params.id);
      if (!presale) {
        res.status(404).json({ error: "Presale not found" });
        return;
      }
      res.json(presale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presale" });
    }
  });

  // Get presale by contract address
  app.get("/api/presales/by-address/:address", async (req, res) => {
    try {
      const presale = await storage.getPresaleByAddress(req.params.address);
      if (!presale) {
        res.status(404).json({ error: "Presale not found" });
        return;
      }
      res.json(presale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presale" });
    }
  });

  // Get presales by creator
  app.get("/api/presales/by-creator/:creator", async (req, res) => {
    try {
      const presales = await storage.getPresalesByCreator(req.params.creator);
      res.json(presales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presales" });
    }
  });

  // Update presale
  app.patch("/api/presales/:id", async (req, res) => {
    try {
      const presale = await storage.updatePresale(req.params.id, req.body);
      if (!presale) {
        res.status(404).json({ error: "Presale not found" });
        return;
      }
      res.json(presale);
    } catch (error) {
      res.status(500).json({ error: "Failed to update presale" });
    }
  });

  // Delete presale
  app.delete("/api/presales/:id", async (req, res) => {
    try {
      const success = await storage.deletePresale(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Presale not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete presale" });
    }
  });

  // Contribution routes
  
  // Record a new contribution
  app.post("/api/contributions", async (req, res) => {
    try {
      const validatedData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(validatedData);
      res.json(contribution);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to record contribution" });
      }
    }
  });

  // Get contributions for a presale
  app.get("/api/contributions/presale/:presaleId", async (req, res) => {
    try {
      const contributions = await storage.getContributionsByPresale(req.params.presaleId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contributions" });
    }
  });

  // Get contributions by contributor address
  app.get("/api/contributions/by-address/:address", async (req, res) => {
    try {
      const contributions = await storage.getContributionsByAddress(req.params.address);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contributions" });
    }
  });

  // NFT Collection routes
  
  // Create NFT collection
  app.post("/api/nft/collections", async (req, res) => {
    try {
      const validatedData = insertNFTCollectionSchema.parse(req.body);
      const collection = await storage.createNFTCollection(validatedData);
      res.json(collection);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create NFT collection" });
      }
    }
  });

  // Get all NFT collections
  app.get("/api/nft/collections", async (req, res) => {
    try {
      const collections = await storage.getAllNFTCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT collections" });
    }
  });

  // Get collection by ID
  app.get("/api/nft/collections/:id", async (req, res) => {
    try {
      const collection = await storage.getNFTCollection(req.params.id);
      if (!collection) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  // Get collection by contract address
  app.get("/api/nft/collections/by-address/:address", async (req, res) => {
    try {
      const collection = await storage.getNFTCollectionByAddress(req.params.address);
      if (!collection) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  // Get collections by creator
  app.get("/api/nft/collections/by-creator/:creator", async (req, res) => {
    try {
      const collections = await storage.getNFTCollectionsByCreator(req.params.creator);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  // Update collection
  app.patch("/api/nft/collections/:id", async (req, res) => {
    try {
      const collection = await storage.updateNFTCollection(req.params.id, req.body);
      if (!collection) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update collection" });
    }
  });

  // NFT Item routes
  
  // Create NFT item
  app.post("/api/nft/items", async (req, res) => {
    try {
      const validatedData = insertNFTItemSchema.parse(req.body);
      const item = await storage.createNFTItem(validatedData);
      res.json(item);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create NFT item" });
      }
    }
  });

  // Get all NFT items
  app.get("/api/nft/items", async (req, res) => {
    try {
      const items = await storage.getAllNFTItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFTs" });
    }
  });

  // Get NFT item by ID
  app.get("/api/nft/items/:id", async (req, res) => {
    try {
      const item = await storage.getNFTItem(req.params.id);
      if (!item) {
        res.status(404).json({ error: "NFT not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT" });
    }
  });

  // Get NFTs by collection (literal path - must come before parameterized routes)
  app.get("/api/nft/items/collection/:collectionId", async (req, res) => {
    try {
      const items = await storage.getNFTItemsByCollection(req.params.collectionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFTs" });
    }
  });

  // Get NFTs by owner (literal path - must come before parameterized routes)
  app.get("/api/nft/items/owner/:owner", async (req, res) => {
    try {
      const items = await storage.getNFTItemsByOwner(req.params.owner);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFTs" });
    }
  });

  // Get NFT by contract address and token ID (parameterized - must come AFTER literal paths)
  app.get("/api/nft/items/:address/:tokenId", async (req, res) => {
    try {
      const item = await storage.getNFTItemByToken(req.params.address, req.params.tokenId);
      if (!item) {
        res.status(404).json({ error: "NFT not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT" });
    }
  });

  // Update NFT item
  app.patch("/api/nft/items/:id", async (req, res) => {
    try {
      const item = await storage.updateNFTItem(req.params.id, req.body);
      if (!item) {
        res.status(404).json({ error: "NFT not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update NFT" });
    }
  });

  // NFT Listing routes
  
  // Create listing
  app.post("/api/nft/listings", async (req, res) => {
    try {
      const validatedData = insertNFTListingSchema.parse(req.body);
      const listing = await storage.createNFTListing(validatedData);
      res.json(listing);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create listing" });
      }
    }
  });

  // Get active listings
  app.get("/api/nft/listings", async (req, res) => {
    try {
      const listings = await storage.getActiveListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Get listing by ID
  app.get("/api/nft/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getNFTListing(req.params.id);
      if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Get listings by token
  app.get("/api/nft/listings/token/:address/:tokenId", async (req, res) => {
    try {
      const listings = await storage.getListingsByToken(req.params.address, req.params.tokenId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Get listings by seller
  app.get("/api/nft/listings/seller/:seller", async (req, res) => {
    try {
      const listings = await storage.getListingsBySeller(req.params.seller);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Update listing
  app.patch("/api/nft/listings/:id", async (req, res) => {
    try {
      const listing = await storage.updateNFTListing(req.params.id, req.body);
      if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  // Deactivate listing
  app.delete("/api/nft/listings/:id", async (req, res) => {
    try {
      const success = await storage.deactivateListing(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Listing not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate listing" });
    }
  });

  // NFT Bid routes
  
  // Create bid
  app.post("/api/nft/bids", async (req, res) => {
    try {
      const validatedData = insertNFTBidSchema.parse(req.body);
      const bid = await storage.createNFTBid(validatedData);
      res.json(bid);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create bid" });
      }
    }
  });

  // Get active bids
  app.get("/api/nft/bids", async (req, res) => {
    try {
      const bids = await storage.getActiveBids();
      res.json(bids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  // Get bid by ID
  app.get("/api/nft/bids/:id", async (req, res) => {
    try {
      const bid = await storage.getNFTBid(req.params.id);
      if (!bid) {
        res.status(404).json({ error: "Bid not found" });
        return;
      }
      res.json(bid);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bid" });
    }
  });

  // Get bids by token
  app.get("/api/nft/bids/token/:address/:tokenId", async (req, res) => {
    try {
      const bids = await storage.getBidsByToken(req.params.address, req.params.tokenId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  // Get bids by bidder
  app.get("/api/nft/bids/bidder/:bidder", async (req, res) => {
    try {
      const bids = await storage.getBidsByBidder(req.params.bidder);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  // Update bid
  app.patch("/api/nft/bids/:id", async (req, res) => {
    try {
      const bid = await storage.updateNFTBid(req.params.id, req.body);
      if (!bid) {
        res.status(404).json({ error: "Bid not found" });
        return;
      }
      res.json(bid);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bid" });
    }
  });

  // Deactivate bid
  app.delete("/api/nft/bids/:id", async (req, res) => {
    try {
      const success = await storage.deactivateBid(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Bid not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate bid" });
    }
  });

  // NFT Activity routes
  
  // Create activity
  app.post("/api/nft/activity", async (req, res) => {
    try {
      const validatedData = insertNFTActivitySchema.parse(req.body);
      const activity = await storage.createNFTActivity(validatedData);
      res.json(activity);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: fromZodError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to create activity" });
      }
    }
  });

  // Get recent activities
  app.get("/api/nft/activity", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Get activities by token
  app.get("/api/nft/activity/token/:address/:tokenId", async (req, res) => {
    try {
      const activities = await storage.getActivitiesByToken(req.params.address, req.params.tokenId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Get activities by address
  app.get("/api/nft/activity/address/:address", async (req, res) => {
    try {
      const activities = await storage.getActivitiesByAddress(req.params.address);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // GitHub sync endpoint (placeholder for future implementation)
  app.post("/api/github/sync", async (req, res) => {
    try {
      // TODO: Implement GitHub auto-sync using Octokit
      // This will push code changes to scuttlecorp/Scuttle repository
      res.json({ 
        message: "GitHub sync not yet implemented",
        note: "Requires @octokit/rest package to be properly installed"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync with GitHub" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
