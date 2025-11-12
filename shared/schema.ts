import { sql } from "drizzle-orm";
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
