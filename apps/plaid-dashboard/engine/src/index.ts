// Using Bun's native serve
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (plaid-dashboard root)
config({ path: resolve(__dirname, "../../.env") });

import { auth } from "./routes/auth";
import { accounts } from "./routes/accounts";
import { transactions } from "./routes/transactions";
import { sync } from "./routes/sync";

// ============================================================================
// App Setup
// ============================================================================

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"], // Dashboard
    credentials: true,
  })
);

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get("/", (c) => {
  return c.json({
    name: "Plaid Dashboard Engine",
    version: "0.1.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Mount route groups
app.route("/auth", auth);
app.route("/accounts", accounts);
app.route("/transactions", transactions);
app.route("/sync", sync);

// ============================================================================
// Error Handling
// ============================================================================

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: err.message ?? "Internal server error",
    },
    500
  );
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not found",
    },
    404
  );
});

// ============================================================================
// Server
// ============================================================================

const port = 3001;

console.log(`
╔══════════════════════════════════════════╗
║     Plaid Dashboard Engine API           ║
║──────────────────────────────────────────║
║  Port: ${port}                              ║
║  Env:  ${process.env.PLAID_ENVIRONMENT ?? "sandbox"}                          ║
╚══════════════════════════════════════════╝
`);

// Export for Bun's native serve
export default {
  port,
  fetch: app.fetch,
};
