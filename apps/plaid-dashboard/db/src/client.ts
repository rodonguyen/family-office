import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres connection
// For migrations, use max 1 connection
// For app usage, this can be pooled
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance with schema for relational queries
export const db = drizzle(client, { schema });

// Export for direct SQL queries if needed
export { client };

// Export schema for convenience
export * from "./schema";
