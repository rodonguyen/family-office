import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set - database features will be disabled");
}

// Create postgres connection (lazy - only if DATABASE_URL is set)
const client = connectionString
  ? postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null;

// Create drizzle instance with schema for relational queries
export const db = client ? drizzle(client, { schema }) : null;

// Export schema for convenience
export * from "./schema";
