// src/lib/db.ts
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

// Helper function to get env var with optional fallback
function getEnv(name: string, fallback?: string): string {
  const v = process.env[name];
  if (!v) {
    if (fallback !== undefined) return fallback;
    throw new Error(`${name} belum di-set di environment`);
  }
  return v;
}

// Check if we're in build time (no DB connection needed)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NODE_ENV === 'production' && !process.env.DB_HOST;

// During build time, create a dummy pool that won't be used
// At runtime, create real pool with required env vars
let pool: Pool;

if (isBuildTime) {
  // Dummy pool for build time (won't actually connect)
  pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'dummy',
    user: 'dummy',
    password: 'dummy',
    // Prevent actual connection attempts during build
    max: 0,
  });
} else {
  // Real pool for runtime
  const host = getEnv("DB_HOST");
  const database = getEnv("DB_DATABASE");
  const user = getEnv("DB_USERNAME");
  const password = getEnv("DB_PASSWORD");
  const port = Number(process.env.DB_PORT || 5432);

  if (!Number.isFinite(port)) {
    throw new Error("DB_PORT tidak valid");
  }

  // Railway/managed biasanya butuh SSL.
  // Set DB_SSL=true kalau perlu.
  const useSSL =
    process.env.DB_SSL === "true" ||
    process.env.PGSSL === "true" ||
    process.env.PGSSLMODE === "require";

  pool = global.__pgPool ?? new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  });

  if (process.env.NODE_ENV !== "production") global.__pgPool = pool;
}

export { pool };

