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
  // Supabase's transaction pooler (pgbouncer, port 6543) — and network devices in front of it —
  // silently drop connections that sit idle. keepAlive sends TCP probes so drops are detected
  // immediately instead of surfacing as "Connection terminated unexpectedly" on the next query, and
  // idleTimeoutMillis proactively recycles idle clients before the pooler does it for us.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  idleTimeoutMillis: 20_000,
  max: Number(process.env.DB_POOL_MAX || 10),
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL client error", error);
});

const isTransientConnectionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code;
  return (
    /connection terminated/i.test(message) ||
    /timeout/i.test(message) ||
    code === "ECONNRESET" ||
    code === "57P01" // admin_shutdown
  );
};

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await pool.query(text, params);
    return result.rows as T[];
  } catch (error) {
    // One retry on a fresh pooled connection — covers the common case where the pooler
    // dropped a specific idle client between requests. A second failure is a real error.
    if (!isTransientConnectionError(error)) throw error;
    console.warn("Retrying query after transient DB connection error", error);
    const result = await pool.query(text, params);
    return result.rows as T[];
  }
}

export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;
