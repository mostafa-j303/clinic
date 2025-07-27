// pages/api/test-connection.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, getPool } from '../../lib/db'; // adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const pool = getPool();
    const result = await pool.query('SELECT 1 AS success');

    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      result: result.rows
    });
  } catch (error: any) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
}
