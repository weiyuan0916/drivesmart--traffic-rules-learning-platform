// ============================================================
// Shared PostgreSQL pool for Vercel Serverless Functions
// ============================================================

import pg from 'pg';

const { Pool } = pg;

interface EnvVars {
  DB_HOST: string | undefined;
  DB_PORT: string | undefined;
  DB_DATABASE: string | undefined;
  DB_USERNAME: string | undefined;
  DB_PASSWORD: string | undefined;
  DB_SSL: string | undefined;
}

function validateEnv(): EnvVars {
  const env: EnvVars = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SSL: process.env.DB_SSL,
  };

  const missing = Object.entries(env)
    .filter(([, v]) => v === undefined && !['DB_PORT', 'DB_DATABASE', 'DB_SSL'].includes(([k]) => k))
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  return env;
}

const globalPool = globalThis as typeof globalThis & {
  __postgresPool?: pg.Pool;
};

function createPool(): pg.Pool {
  const env = validateEnv();

  return new Pool({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '5432'),
    database: env.DB_DATABASE || 'postgres',
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    ssl:
      env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
}

export function getPool(): pg.Pool {
  if (!globalPool.__postgresPool) {
    globalPool.__postgresPool = createPool();
  }
  return globalPool.__postgresPool;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return (rows[0] as T) ?? null;
}
