// pages/api/delete-product.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid or missing product ID' });
  }

  try {
    const pool = getPool();

    // Then delete the product itself
    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
