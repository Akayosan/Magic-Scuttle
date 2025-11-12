import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTokenSchema, insertPresaleSchema, insertContributionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
