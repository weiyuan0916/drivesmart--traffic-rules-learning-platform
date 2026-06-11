// ============================================================
// Shared PostgreSQL pool for Vercel Serverless Functions
// Uses connection string from environment variables
// ============================================================

import { Pool } from 'pg';

const globalPool = globalThis as typeof globalThis & {
  __postgresPool?: Pool;
};

function createPool(): Pool {
  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'postgres',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
}

export function getPool(): Pool {
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
