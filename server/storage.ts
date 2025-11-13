// database integration blueprint - see blueprint:javascript_database
import { 
  Token, InsertToken,
  Presale, InsertPresale,
  Contribution, InsertContribution,
  NFTCollection, InsertNFTCollection,
  NFTItem, InsertNFTItem,
  NFTListing, InsertNFTListing,
  NFTBid, InsertNFTBid,
  NFTActivity, InsertNFTActivity,
  tokens, presales, contributions,
  nftCollections, nftItems, nftListings, nftBids, nftActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

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
  
  // NFT Collection operations
  createNFTCollection(collection: InsertNFTCollection): Promise<NFTCollection>;
  getNFTCollection(id: string): Promise<NFTCollection | null>;
  getNFTCollectionByAddress(contractAddress: string): Promise<NFTCollection | null>;
  getNFTCollectionsByCreator(creator: string): Promise<NFTCollection[]>;
  getAllNFTCollections(): Promise<NFTCollection[]>;
  updateNFTCollection(id: string, updates: Partial<NFTCollection>): Promise<NFTCollection | null>;
  
  // NFT Item operations
  createNFTItem(item: InsertNFTItem): Promise<NFTItem>;
  getNFTItem(id: string): Promise<NFTItem | null>;
  getNFTItemByToken(contractAddress: string, tokenId: string): Promise<NFTItem | null>;
  getNFTItemsByCollection(collectionId: string): Promise<NFTItem[]>;
  getNFTItemsByOwner(owner: string): Promise<NFTItem[]>;
  getAllNFTItems(): Promise<NFTItem[]>;
  updateNFTItem(id: string, updates: Partial<NFTItem>): Promise<NFTItem | null>;
  
  // NFT Listing operations
  createNFTListing(listing: InsertNFTListing): Promise<NFTListing>;
  getNFTListing(id: string): Promise<NFTListing | null>;
  getActiveListings(): Promise<NFTListing[]>;
  getListingsByToken(contractAddress: string, tokenId: string): Promise<NFTListing[]>;
  getListingsBySeller(seller: string): Promise<NFTListing[]>;
  updateNFTListing(id: string, updates: Partial<NFTListing>): Promise<NFTListing | null>;
  deactivateListing(id: string): Promise<boolean>;
  
  // NFT Bid operations
  createNFTBid(bid: InsertNFTBid): Promise<NFTBid>;
  getNFTBid(id: string): Promise<NFTBid | null>;
  getActiveBids(): Promise<NFTBid[]>;
  getBidsByToken(contractAddress: string, tokenId: string): Promise<NFTBid[]>;
  getBidsByBidder(bidder: string): Promise<NFTBid[]>;
  updateNFTBid(id: string, updates: Partial<NFTBid>): Promise<NFTBid | null>;
  deactivateBid(id: string): Promise<boolean>;
  
  // NFT Activity operations
  createNFTActivity(activity: InsertNFTActivity): Promise<NFTActivity>;
  getActivitiesByToken(contractAddress: string, tokenId: string): Promise<NFTActivity[]>;
  getActivitiesByAddress(address: string): Promise<NFTActivity[]>;
  getRecentActivities(limit?: number): Promise<NFTActivity[]>;
}

export class DatabaseStorage implements IStorage {
  // ============== TOKEN OPERATIONS ==============
  async createToken(insertToken: InsertToken): Promise<Token> {
    const [token] = await db.insert(tokens).values(insertToken).returning();
    return token;
  }

  async getToken(id: string): Promise<Token | null> {
    const [token] = await db.select().from(tokens).where(eq(tokens.id, id));
    return token || null;
  }

  async getTokenByAddress(contractAddress: string): Promise<Token | null> {
    const [token] = await db.select().from(tokens)
      .where(sql`lower(${tokens.contractAddress}) = lower(${contractAddress})`);
    return token || null;
  }

  async getTokensByCreator(creator: string): Promise<Token[]> {
    return await db.select().from(tokens)
      .where(sql`lower(${tokens.creator}) = lower(${creator})`);
  }

  async getAllTokens(): Promise<Token[]> {
    return await db.select().from(tokens).orderBy(desc(tokens.createdAt));
  }

  async updateToken(id: string, updates: Partial<Token>): Promise<Token | null> {
    const [updated] = await db.update(tokens)
      .set(updates)
      .where(eq(tokens.id, id))
      .returning();
    return updated || null;
  }

  async deleteToken(id: string): Promise<boolean> {
    const result = await db.delete(tokens).where(eq(tokens.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ============== PRESALE OPERATIONS ==============
  async createPresale(insertPresale: InsertPresale): Promise<Presale> {
    const [presale] = await db.insert(presales).values(insertPresale).returning();
    return presale;
  }

  async getPresale(id: string): Promise<Presale | null> {
    const [presale] = await db.select().from(presales).where(eq(presales.id, id));
    return presale || null;
  }

  async getPresaleByAddress(presaleAddress: string): Promise<Presale | null> {
    const [presale] = await db.select().from(presales)
      .where(sql`lower(${presales.presaleAddress}) = lower(${presaleAddress})`);
    return presale || null;
  }

  async getPresalesByCreator(creator: string): Promise<Presale[]> {
    return await db.select().from(presales)
      .where(sql`lower(${presales.creator}) = lower(${creator})`)
      .orderBy(desc(presales.createdAt));
  }

  async getActivePresales(): Promise<Presale[]> {
    return await db.select().from(presales)
      .where(eq(presales.isActive, true))
      .orderBy(desc(presales.createdAt));
  }

  async getAllPresales(): Promise<Presale[]> {
    return await db.select().from(presales).orderBy(desc(presales.createdAt));
  }

  async updatePresale(id: string, updates: Partial<Presale>): Promise<Presale | null> {
    const [updated] = await db.update(presales)
      .set(updates)
      .where(eq(presales.id, id))
      .returning();
    return updated || null;
  }

  async deletePresale(id: string): Promise<boolean> {
    const result = await db.delete(presales).where(eq(presales.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ============== CONTRIBUTION OPERATIONS ==============
  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const [contribution] = await db.insert(contributions).values(insertContribution).returning();
    return contribution;
  }

  async getContributionsByPresale(presaleId: string): Promise<Contribution[]> {
    return await db.select().from(contributions)
      .where(eq(contributions.presaleId, presaleId))
      .orderBy(desc(contributions.timestamp));
  }

  async getContributionsByAddress(contributor: string): Promise<Contribution[]> {
    return await db.select().from(contributions)
      .where(sql`lower(${contributions.contributor}) = lower(${contributor})`)
      .orderBy(desc(contributions.timestamp));
  }

  // ============== NFT COLLECTION OPERATIONS ==============
  async createNFTCollection(insertCollection: InsertNFTCollection): Promise<NFTCollection> {
    const [collection] = await db.insert(nftCollections).values(insertCollection).returning();
    return collection;
  }

  async getNFTCollection(id: string): Promise<NFTCollection | null> {
    const [collection] = await db.select().from(nftCollections).where(eq(nftCollections.id, id));
    return collection || null;
  }

  async getNFTCollectionByAddress(contractAddress: string): Promise<NFTCollection | null> {
    const [collection] = await db.select().from(nftCollections)
      .where(sql`lower(${nftCollections.contractAddress}) = lower(${contractAddress})`);
    return collection || null;
  }

  async getNFTCollectionsByCreator(creator: string): Promise<NFTCollection[]> {
    return await db.select().from(nftCollections)
      .where(sql`lower(${nftCollections.creator}) = lower(${creator})`)
      .orderBy(desc(nftCollections.createdAt));
  }

  async getAllNFTCollections(): Promise<NFTCollection[]> {
    return await db.select().from(nftCollections).orderBy(desc(nftCollections.createdAt));
  }

  async updateNFTCollection(id: string, updates: Partial<NFTCollection>): Promise<NFTCollection | null> {
    const [updated] = await db.update(nftCollections)
      .set(updates)
      .where(eq(nftCollections.id, id))
      .returning();
    return updated || null;
  }

  // ============== NFT ITEM OPERATIONS ==============
  async createNFTItem(insertItem: InsertNFTItem): Promise<NFTItem> {
    const [item] = await db.insert(nftItems).values(insertItem).returning();
    return item;
  }

  async getNFTItem(id: string): Promise<NFTItem | null> {
    const [item] = await db.select().from(nftItems).where(eq(nftItems.id, id));
    return item || null;
  }

  async getNFTItemByToken(contractAddress: string, tokenId: string): Promise<NFTItem | null> {
    const [item] = await db.select().from(nftItems)
      .where(and(
        sql`lower(${nftItems.contractAddress}) = lower(${contractAddress})`,
        eq(nftItems.tokenId, tokenId)
      ));
    return item || null;
  }

  async getNFTItemsByCollection(collectionId: string): Promise<NFTItem[]> {
    return await db.select().from(nftItems)
      .where(eq(nftItems.collectionId, collectionId))
      .orderBy(desc(nftItems.mintedAt));
  }

  async getNFTItemsByOwner(owner: string): Promise<NFTItem[]> {
    return await db.select().from(nftItems)
      .where(sql`lower(${nftItems.owner}) = lower(${owner})`)
      .orderBy(desc(nftItems.mintedAt));
  }

  async getAllNFTItems(): Promise<NFTItem[]> {
    return await db.select().from(nftItems)
      .orderBy(desc(nftItems.mintedAt));
  }

  async updateNFTItem(id: string, updates: Partial<NFTItem>): Promise<NFTItem | null> {
    const [updated] = await db.update(nftItems)
      .set(updates)
      .where(eq(nftItems.id, id))
      .returning();
    return updated || null;
  }

  // ============== NFT LISTING OPERATIONS ==============
  async createNFTListing(insertListing: InsertNFTListing): Promise<NFTListing> {
    const [listing] = await db.insert(nftListings).values(insertListing).returning();
    return listing;
  }

  async getNFTListing(id: string): Promise<NFTListing | null> {
    const [listing] = await db.select().from(nftListings).where(eq(nftListings.id, id));
    return listing || null;
  }

  async getActiveListings(): Promise<NFTListing[]> {
    return await db.select().from(nftListings)
      .where(eq(nftListings.isActive, true))
      .orderBy(desc(nftListings.createdAt));
  }

  async getListingsByToken(contractAddress: string, tokenId: string): Promise<NFTListing[]> {
    return await db.select().from(nftListings)
      .where(and(
        sql`lower(${nftListings.contractAddress}) = lower(${contractAddress})`,
        eq(nftListings.tokenId, tokenId)
      ))
      .orderBy(desc(nftListings.createdAt));
  }

  async getListingsBySeller(seller: string): Promise<NFTListing[]> {
    return await db.select().from(nftListings)
      .where(sql`lower(${nftListings.seller}) = lower(${seller})`)
      .orderBy(desc(nftListings.createdAt));
  }

  async updateNFTListing(id: string, updates: Partial<NFTListing>): Promise<NFTListing | null> {
    const [updated] = await db.update(nftListings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nftListings.id, id))
      .returning();
    return updated || null;
  }

  async deactivateListing(id: string): Promise<boolean> {
    const [updated] = await db.update(nftListings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(nftListings.id, id))
      .returning();
    return !!updated;
  }

  // ============== NFT BID OPERATIONS ==============
  async createNFTBid(insertBid: InsertNFTBid): Promise<NFTBid> {
    const [bid] = await db.insert(nftBids).values(insertBid).returning();
    return bid;
  }

  async getNFTBid(id: string): Promise<NFTBid | null> {
    const [bid] = await db.select().from(nftBids).where(eq(nftBids.id, id));
    return bid || null;
  }

  async getActiveBids(): Promise<NFTBid[]> {
    return await db.select().from(nftBids)
      .where(eq(nftBids.isActive, true))
      .orderBy(desc(nftBids.createdAt));
  }

  async getBidsByToken(contractAddress: string, tokenId: string): Promise<NFTBid[]> {
    return await db.select().from(nftBids)
      .where(and(
        sql`lower(${nftBids.contractAddress}) = lower(${contractAddress})`,
        eq(nftBids.tokenId, tokenId)
      ))
      .orderBy(desc(nftBids.createdAt));
  }

  async getBidsByBidder(bidder: string): Promise<NFTBid[]> {
    return await db.select().from(nftBids)
      .where(sql`lower(${nftBids.bidder}) = lower(${bidder})`)
      .orderBy(desc(nftBids.createdAt));
  }

  async updateNFTBid(id: string, updates: Partial<NFTBid>): Promise<NFTBid | null> {
    const [updated] = await db.update(nftBids)
      .set(updates)
      .where(eq(nftBids.id, id))
      .returning();
    return updated || null;
  }

  async deactivateBid(id: string): Promise<boolean> {
    const [updated] = await db.update(nftBids)
      .set({ isActive: false })
      .where(eq(nftBids.id, id))
      .returning();
    return !!updated;
  }

  // ============== NFT ACTIVITY OPERATIONS ==============
  async createNFTActivity(insertActivity: InsertNFTActivity): Promise<NFTActivity> {
    const [activity] = await db.insert(nftActivity).values(insertActivity).returning();
    return activity;
  }

  async getActivitiesByToken(contractAddress: string, tokenId: string): Promise<NFTActivity[]> {
    return await db.select().from(nftActivity)
      .where(and(
        sql`lower(${nftActivity.contractAddress}) = lower(${contractAddress})`,
        eq(nftActivity.tokenId, tokenId)
      ))
      .orderBy(desc(nftActivity.timestamp));
  }

  async getActivitiesByAddress(address: string): Promise<NFTActivity[]> {
    return await db.select().from(nftActivity)
      .where(sql`
        lower(${nftActivity.from}) = lower(${address}) OR 
        lower(${nftActivity.to}) = lower(${address})
      `)
      .orderBy(desc(nftActivity.timestamp));
  }

  async getRecentActivities(limit: number = 50): Promise<NFTActivity[]> {
    return await db.select().from(nftActivity)
      .orderBy(desc(nftActivity.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
