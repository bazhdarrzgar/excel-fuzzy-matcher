import { MongoClient, Database, Collection } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts";

// Load environment variables
await load({ export: true });

let client: MongoClient;
let db: Database;

export interface MatchResult {
  _id?: string;
  fileName1: string;
  fileName2: string;
  column1: string;
  column2: string;
  matches: Array<{
    source: string;
    target: string;
    score: number;
    sourceRow: number;
    targetRow: number;
  }>;
  timestamp: Date;
  totalMatches: number;
}

export interface UploadedFile {
  _id?: string;
  filename: string;
  originalName: string;
  size: number;
  columns: string[];
  rowCount: number;
  uploadedAt: Date;
}

export async function connectDB(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    const mongoUri = Deno.env.get("MONGODB_URI") || "mongodb://127.0.0.1:27017";
    const dbName = Deno.env.get("DB_NAME") || "fuzzy_matcher";

    console.log(`🔌 Connecting to MongoDB: ${mongoUri}`);
    
    client = new MongoClient();
    await client.connect(mongoUri);
    
    db = client.database(dbName);
    
    console.log(`✅ Connected to database: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export function getCollection<T = any>(name: string): Collection<T> {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db.collection<T>(name);
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Collection helpers
export const getMatchResultsCollection = () => getCollection<MatchResult>("match_results");
export const getUploadedFilesCollection = () => getCollection<UploadedFile>("uploaded_files");