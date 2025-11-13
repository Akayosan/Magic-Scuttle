import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, boolean, bigint, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Token Table
export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  totalSupply: text("total_supply").notNull(),
  isSupplyEncrypted: boolean("is_supply_encrypted").notNull().default(false),
  contractAddress: text("contract_address").notNull(),
  creator: text("creator").notNull(),
  decimals: integer("decimals").notNull().default(18),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;

// Presale Table
export const presales = pgTable("presales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenId: varchar("token_id").notNull(),
  tokenAddress: text("token_address").notNull(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  presaleAddress: text("presale_address").notNull(),
  creator: text("creator").notNull(),
  rate: text("rate").notNull(),
  hardCap: text("hard_cap").notNull(),
  softCap: text("soft_cap").notNull(),
  minContribution: text("min_contribution").notNull(),
  maxContribution: text("max_contribution").notNull(),
  startTime: bigint("start_time", { mode: "number" }).notNull(),
  endTime: bigint("end_time", { mode: "number" }).notNull(),
  totalRaised: text("total_raised").notNull().default("0"),
  totalContributors: integer("total_contributors").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isEncrypted: boolean("is_encrypted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPresaleSchema = createInsertSchema(presales).omit({
  id: true,
  totalRaised: true,
  totalContributors: true,
  isActive: true,
  createdAt: true,
});

export type Presale = typeof presales.$inferSelect;
export type InsertPresale = z.infer<typeof insertPresaleSchema>;

// Contribution Table
export const contributions = pgTable("contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presaleId: varchar("presale_id").notNull(),
  contributor: text("contributor").notNull(),
  amount: text("amount").notNull(),
  isEncrypted: boolean("is_encrypted").notNull().default(false),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  timestamp: true,
});

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;

// Wallet Connection State (not stored in DB)
export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

// Transaction Status (not stored in DB)
export type TransactionStatus = 
  | "idle" 
  | "pending" 
  | "confirming" 
  | "success" 
  | "error";

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

// NFT Collection Table
export const nftCollections = pgTable("nft_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractAddress: text("contract_address").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  creator: text("creator").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  bannerUrl: text("banner_url"),
  royaltyRecipient: text("royalty_recipient"),
  royaltyBasisPoints: integer("royalty_basis_points").default(0),
  totalSupply: integer("total_supply").notNull().default(0),
  floorPrice: text("floor_price"),
  volume: text("volume").default("0"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNFTCollectionSchema = createInsertSchema(nftCollections).omit({
  id: true,
  totalSupply: true,
  floorPrice: true,
  volume: true,
  createdAt: true,
});

export type NFTCollection = typeof nftCollections.$inferSelect;
export type InsertNFTCollection = z.infer<typeof insertNFTCollectionSchema>;

// NFT Item Table
export const nftItems = pgTable("nft_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").notNull(),
  tokenId: text("token_id").notNull(),
  contractAddress: text("contract_address").notNull(),
  owner: text("owner").notNull(),
  tokenURI: text("token_uri"),
  imageUrl: text("image_url"),
  name: text("name"),
  description: text("description"),
  hasEncryptedRarity: boolean("has_encrypted_rarity").default(false),
  revealedRarity: integer("revealed_rarity"),
  hasEncryptedAttributes: boolean("has_encrypted_attributes").default(false),
  attributes: text("attributes"),
  mintedAt: timestamp("minted_at").notNull().default(sql`now()`),
});

export const insertNFTItemSchema = createInsertSchema(nftItems).omit({
  id: true,
  revealedRarity: true,
  mintedAt: true,
});

export type NFTItem = typeof nftItems.$inferSelect;
export type InsertNFTItem = z.infer<typeof insertNFTItemSchema>;

// NFT Listing Table
export const nftListings = pgTable("nft_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nftId: varchar("nft_id").notNull(),
  contractAddress: text("contract_address").notNull(),
  tokenId: text("token_id").notNull(),
  seller: text("seller").notNull(),
  price: text("price").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  listingType: text("listing_type").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertNFTListingSchema = createInsertSchema(nftListings).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export type NFTListing = typeof nftListings.$inferSelect;
export type InsertNFTListing = z.infer<typeof insertNFTListingSchema>;

// NFT Bid Table  
export const nftBids = pgTable("nft_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nftId: varchar("nft_id"),
  contractAddress: text("contract_address").notNull(),
  tokenId: text("token_id").notNull(),
  bidder: text("bidder").notNull(),
  amount: text("amount").notNull(),
  bidType: text("bid_type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNFTBidSchema = createInsertSchema(nftBids).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export type NFTBid = typeof nftBids.$inferSelect;
export type InsertNFTBid = z.infer<typeof insertNFTBidSchema>;

// NFT Activity Table
export const nftActivity = pgTable("nft_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nftId: varchar("nft_id"),
  contractAddress: text("contract_address").notNull(),
  tokenId: text("token_id").notNull(),
  activityType: text("activity_type").notNull(),
  from: text("from"),
  to: text("to"),
  price: text("price"),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertNFTActivitySchema = createInsertSchema(nftActivity).omit({
  id: true,
  timestamp: true,
});

export type NFTActivity = typeof nftActivity.$inferSelect;
export type InsertNFTActivity = z.infer<typeof insertNFTActivitySchema>;

// Database Relations
export const nftCollectionsRelations = relations(nftCollections, ({ many }) => ({
  items: many(nftItems),
}));

export const nftItemsRelations = relations(nftItems, ({ one, many }) => ({
  collection: one(nftCollections, {
    fields: [nftItems.collectionId],
    references: [nftCollections.id],
  }),
  listings: many(nftListings),
  bids: many(nftBids),
  activities: many(nftActivity),
}));

export const nftListingsRelations = relations(nftListings, ({ one }) => ({
  nft: one(nftItems, {
    fields: [nftListings.nftId],
    references: [nftItems.id],
  }),
}));

export const nftBidsRelations = relations(nftBids, ({ one }) => ({
  nft: one(nftItems, {
    fields: [nftBids.nftId],
    references: [nftItems.id],
  }),
}));

export const nftActivityRelations = relations(nftActivity, ({ one }) => ({
  nft: one(nftItems, {
    fields: [nftActivity.nftId],
    references: [nftItems.id],
  }),
}));

// fhEVM Configuration for Sepolia
export const FHEVM_CONFIG = {
  chainId: 11155111, // Sepolia
  gatewayChainId: 55815, // Zama Gateway
  network: "https://eth-sepolia.public.blastapi.io",
  relayerUrl: "https://relayer.testnet.zama.cloud",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
  inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
  verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
} as const;
