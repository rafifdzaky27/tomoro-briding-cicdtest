// src/lib/db.ts
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} belum di-set di environment`);
  return v;
}

const host = must("DB_HOST");
const database = must("DB_DATABASE");
const user = must("DB_USERNAME");
const password = must("DB_PASSWORD");
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

export const pool =
  global.__pgPool ??
  new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;
