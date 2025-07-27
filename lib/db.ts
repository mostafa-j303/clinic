// db.ts
import { Pool } from 'pg';

let pool: Pool | null = null;

export function connectToDatabase() {
  if (!pool) {
    pool = new Pool({
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,       // e.g., 'localhost' or your server IP
      port: parseInt(process.env.DATABASE_PORT || '5432'), // PostgreSQL default port
      database: process.env.DATABASE_NAME,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database connection not established.');
  }
  return pool;
}

export async function closeDatabaseConnection() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Optional: Immediately connect
export const poolPromise = connectToDatabase();
