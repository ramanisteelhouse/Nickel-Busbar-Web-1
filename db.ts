import dotenv from "dotenv";
import dns from "node:dns";
import { Pool } from "pg";

dotenv.config();

const directConnectionString = process.env.SUPABASE_DB_URL?.trim();
const poolerConnectionString = process.env.SUPABASE_POOLER_URL?.trim();
const vercelPostgresConnectionString = process.env.POSTGRES_URL?.trim();
const genericConnectionString = process.env.DATABASE_URL?.trim();
const connectionString =
  poolerConnectionString ||
  vercelPostgresConnectionString ||
  genericConnectionString ||
  directConnectionString;
const allowSupabaseDirectUrl = process.env.ALLOW_SUPABASE_DIRECT_URL === "true";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Older Node runtimes may not support this API.
}

if (!connectionString) {
  throw new Error(
    "Missing DB connection string. Set SUPABASE_POOLER_URL (preferred), POSTGRES_URL, DATABASE_URL, or SUPABASE_DB_URL in .env."
  );
}

const isSupabaseDirectHost =
  !poolerConnectionString &&
  !vercelPostgresConnectionString &&
  !genericConnectionString &&
  directConnectionString?.includes("@db.") &&
  directConnectionString.includes(".supabase.co");

if (isSupabaseDirectHost && !allowSupabaseDirectUrl) {
  const message =
    "[db] SUPABASE_DB_URL is using Supabase direct host (db.<ref>.supabase.co), which is IPv6-only on many projects.\n" +
    "[db] Set SUPABASE_POOLER_URL (Session Pooler, port 5432) from Supabase Dashboard -> Connect.\n" +
    "[db] If your machine has working IPv6 and you intentionally want direct DB host, set ALLOW_SUPABASE_DIRECT_URL=true.";

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }

  console.warn(message);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 8000),
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL client error", error);
});

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;
