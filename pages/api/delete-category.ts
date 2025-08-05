import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid or missing category ID' });
    }

    const pool = getPool();

    // Optional: Check if category is in use before deleting
    const usedCheck = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [id]
    );

    if (parseInt(usedCheck.rows[0].count) > 0) {
      return res.status(409).json({ message: 'Category is in use and cannot be deleted' });
    }

    // Delete the category
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
