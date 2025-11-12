import { 
  Token, 
  InsertToken, 
  Presale, 
  InsertPresale,
  Contribution,
  InsertContribution 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Token operations
  createToken(token: InsertToken): Promise<Token>;
  getToken(id: string): Promise<Token | null>;
  getTokenByAddress(contractAddress: string): Promise<Token | null>;
  getTokensByCreator(creator: string): Promise<Token[]>;
  getAllTokens(): Promise<Token[]>;
  updateToken(id: string, updates: Partial<Token>): Promise<Token | null>;
  deleteToken(id: string): Promise<boolean>;
  
  // Presale operations
  createPresale(presale: InsertPresale): Promise<Presale>;
  getPresale(id: string): Promise<Presale | null>;
  getPresaleByAddress(presaleAddress: string): Promise<Presale | null>;
  getPresalesByCreator(creator: string): Promise<Presale[]>;
  getActivePresales(): Promise<Presale[]>;
  getAllPresales(): Promise<Presale[]>;
  updatePresale(id: string, updates: Partial<Presale>): Promise<Presale | null>;
  deletePresale(id: string): Promise<boolean>;
  
  // Contribution operations
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  getContributionsByPresale(presaleId: string): Promise<Contribution[]>;
  getContributionsByAddress(contributor: string): Promise<Contribution[]>;
}

export class MemStorage implements IStorage {
  private tokens: Map<string, Token>;
  private presales: Map<string, Presale>;
  private contributions: Map<string, Contribution>;

  constructor() {
    this.tokens = new Map();
    this.presales = new Map();
    this.contributions = new Map();
  }

  // Token operations
  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = randomUUID();
    const token: Token = { 
      ...insertToken, 
      id,
      createdAt: new Date()
    };
    this.tokens.set(id, token);
    return token;
  }

  async getToken(id: string): Promise<Token | null> {
    return this.tokens.get(id) || null;
  }

  async getTokenByAddress(contractAddress: string): Promise<Token | null> {
    return Array.from(this.tokens.values()).find(
      (token) => token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    ) || null;
  }

  async getTokensByCreator(creator: string): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.creator.toLowerCase() === creator.toLowerCase()
    );
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async updateToken(id: string, updates: Partial<Token>): Promise<Token | null> {
    const token = this.tokens.get(id);
    if (!token) return null;
    
    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  async deleteToken(id: string): Promise<boolean> {
    return this.tokens.delete(id);
  }

  // Presale operations
  async createPresale(insertPresale: InsertPresale): Promise<Presale> {
    const id = randomUUID();
    const presale: Presale = {
      ...insertPresale,
      id,
      totalRaised: "0",
      totalContributors: 0,
      isActive: true,
      createdAt: new Date()
    };
    this.presales.set(id, presale);
    return presale;
  }

  async getPresale(id: string): Promise<Presale | null> {
    return this.presales.get(id) || null;
  }

  async getPresaleByAddress(presaleAddress: string): Promise<Presale | null> {
    return Array.from(this.presales.values()).find(
      (presale) => presale.presaleAddress.toLowerCase() === presaleAddress.toLowerCase()
    ) || null;
  }

  async getPresalesByCreator(creator: string): Promise<Presale[]> {
    return Array.from(this.presales.values()).filter(
      (presale) => presale.creator.toLowerCase() === creator.toLowerCase()
    );
  }

  async getActivePresales(): Promise<Presale[]> {
    const now = Date.now() / 1000;
    return Array.from(this.presales.values()).filter(
      (presale) => presale.isActive && presale.endTime > now
    );
  }

  async getAllPresales(): Promise<Presale[]> {
    return Array.from(this.presales.values());
  }

  async updatePresale(id: string, updates: Partial<Presale>): Promise<Presale | null> {
    const presale = this.presales.get(id);
    if (!presale) return null;
    
    const updatedPresale = { ...presale, ...updates };
    this.presales.set(id, updatedPresale);
    return updatedPresale;
  }

  async deletePresale(id: string): Promise<boolean> {
    return this.presales.delete(id);
  }

  // Contribution operations
  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const id = randomUUID();
    const contribution: Contribution = {
      ...insertContribution,
      id,
      timestamp: new Date()
    };
    this.contributions.set(id, contribution);
    
    // Update presale stats
    const presale = this.presales.get(insertContribution.presaleId);
    if (presale) {
      const currentRaised = BigInt(presale.totalRaised);
      const contributionAmount = BigInt(insertContribution.amount);
      presale.totalRaised = (currentRaised + contributionAmount).toString();
      presale.totalContributors += 1;
      this.presales.set(presale.id, presale);
    }
    
    return contribution;
  }

  async getContributionsByPresale(presaleId: string): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.presaleId === presaleId
    );
  }

  async getContributionsByAddress(contributor: string): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.contributor.toLowerCase() === contributor.toLowerCase()
    );
  }
}

export const storage = new MemStorage();
