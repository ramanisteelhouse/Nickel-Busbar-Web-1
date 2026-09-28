import { Pool, type PoolClient } from "pg";

/**
 * The Postgres connection, for three runtimes.
 *
 * Node (the dev server, the build scripts and the Vercel/Netlify functions) reads the
 * connection string from the environment, as it always has. Cloudflare Workers has no
 * `process.env` at module scope and no `node:dns`, and its connection string arrives per
 * request on the Hyperdrive binding — so nothing here may run at import time, and the Worker
 * calls `configureDatabase()` on the way in.
 *
 * That is the whole reason the pool is created lazily. Previously this module read
 * `process.env` and threw on import if it was empty, which is correct for a server that owns
 * its environment and fatal for a Worker, where importing the module is not the same event as
 * having a database to talk to.
 *
 * pg 8.16.3+ is what makes this possible on Workers at all: it is the first version Hyperdrive
 * supports, and it needs the `nodejs_compat` flag. See wrangler.jsonc.
 */

let pool: Pool | null = null;
let overrideConnectionString: string | null = null;
let nodeEnvironmentPrepared = false;

/**
 * Called by the Worker with `env.HYPERDRIVE.connectionString` before any query runs. Changing
 * the string discards the existing pool so the next query reconnects through it.
 */
export function configureDatabase(connectionString: string): void {
  const next = connectionString?.trim();
  if (!next || next === overrideConnectionString) return;
  overrideConnectionString = next;
  if (pool) {
    // Nothing awaits this: the old pool belongs to a previous configuration and its clients
    // are not reused, so draining it must not delay the request that just reconfigured us.
    void pool.end().catch(() => {});
    pool = null;
  }
}

/**
 * dotenv and the IPv4 DNS preference are Node-only and are loaded on first use rather than at
 * import, because importing `node:dns` at module scope breaks the Workers bundle.
 */
function prepareNodeEnvironment(): void {
  if (nodeEnvironmentPrepared) return;
  nodeEnvironmentPrepared = true;
  if (typeof process === "undefined" || !process.versions?.node) return;
  try {
    // require rather than import: this runs inside a sync function and must not be hoisted
    // into the Workers bundle's module graph.
    const { createRequire } = require("node:module");
    const nodeRequire = createRequire(import.meta.url);
    nodeRequire("dotenv").config();
    nodeRequire("node:dns").setDefaultResultOrder("ipv4first");
  } catch {
    // Either dotenv is absent (production, where the platform supplies the environment) or the
    // runtime predates setDefaultResultOrder. Neither is fatal.
  }
}

function resolveConnectionString(): string {
  if (overrideConnectionString) return overrideConnectionString;

  prepareNodeEnvironment();
  const env = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  const direct = env.SUPABASE_DB_URL?.trim();
  const pooler = env.SUPABASE_POOLER_URL?.trim();
  const vercelPostgres = env.POSTGRES_URL?.trim();
  const generic = env.DATABASE_URL?.trim();
  const connectionString = pooler || vercelPostgres || generic || direct;

  if (!connectionString) {
    throw new Error(
      "Missing DB connection string. Set SUPABASE_POOLER_URL (preferred), POSTGRES_URL, DATABASE_URL, or SUPABASE_DB_URL in .env, " +
        "or call configureDatabase() with the Hyperdrive connection string on Cloudflare Workers."
    );
  }

  const isSupabaseDirectHost =
    !pooler && !vercelPostgres && !generic && direct?.includes("@db.") && direct.includes(".supabase.co");

  if (isSupabaseDirectHost && env.ALLOW_SUPABASE_DIRECT_URL !== "true") {
    const message =
      "[db] SUPABASE_DB_URL is using Supabase direct host (db.<ref>.supabase.co), which is IPv6-only on many projects.\n" +
      "[db] Set SUPABASE_POOLER_URL (Session Pooler, port 5432) from Supabase Dashboard -> Connect.\n" +
      "[db] If your machine has working IPv6 and you intentionally want direct DB host, set ALLOW_SUPABASE_DIRECT_URL=true.";
    if (env.NODE_ENV === "production") throw new Error(message);
    console.warn(message);
  }

  return connectionString;
}

function getPool(): Pool {
  if (pool) return pool;

  const env = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  // On Workers the connection is already pooled by Hyperdrive, so this process keeps a single
  // client and lets Hyperdrive do the pooling it exists to do.
  const onWorkers = Boolean(overrideConnectionString);

  pool = new Pool({
    connectionString: resolveConnectionString(),
    ssl: onWorkers ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: Number(env.DB_CONNECTION_TIMEOUT_MS || 8000),
    // Supabase's transaction pooler (pgbouncer, port 6543) — and network devices in front of it —
    // silently drop connections that sit idle. keepAlive sends TCP probes so drops are detected
    // immediately instead of surfacing as "Connection terminated unexpectedly" on the next query, and
    // idleTimeoutMillis proactively recycles idle clients before the pooler does it for us.
    keepAlive: !onWorkers,
    keepAliveInitialDelayMillis: 10_000,
    idleTimeoutMillis: 20_000,
    // Each serverless instance gets its OWN pool, and Vercel runs many instances
    // concurrently. A max of 10 means two warm instances alone can exhaust a
    // Supabase session-mode pooler (pool_size 15) and every query starts failing
    // with EMAXCONNSESSION. One connection per instance is the correct shape here;
    // concurrency comes from more instances, not a bigger pool inside each.
    max: Number(env.DB_POOL_MAX || (onWorkers || env.VERCEL ? 1 : 10)),
  });

  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL client error", error);
  });

  return pool;
}

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
    const result = await getPool().query(text, params);
    return result.rows as T[];
  } catch (error) {
    // One retry on a fresh pooled connection — covers the common case where the pooler
    // dropped a specific idle client between requests. A second failure is a real error.
    if (!isTransientConnectionError(error)) throw error;
    console.warn("Retrying query after transient DB connection error", error);
    const result = await getPool().query(text, params);
    return result.rows as T[];
  }
}

export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * The default export keeps the shape callers already use (`pool.connect()`, `pool.end()`), but
 * resolves the real pool at call time rather than at import. Only these two methods are used
 * anywhere in the codebase; anything else should go through query()/queryOne().
 */
const lazyPool = {
  connect: (): Promise<PoolClient> => getPool().connect(),
  end: async (): Promise<void> => {
    if (!pool) return;
    const current = pool;
    pool = null;
    await current.end();
  },
};

export default lazyPool;
