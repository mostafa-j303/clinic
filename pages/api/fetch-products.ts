// pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../lib/db'; // Adjust this path to where your db.ts is located

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const pool = getPool();

    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.details,
        c.name AS category,
        pi.filename,
        pi.mimetype,
        encode(pi.image, 'base64') AS image_base64
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT * 
        FROM product_images 
        WHERE product_id = p.id 
        ORDER BY id ASC 
        LIMIT 1
      ) pi ON true;
    `;

    const { rows } = await pool.query(query);

    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      details: row.details,
      category: row.category,
      image: row.image_base64
        ? `data:${row.mimetype};base64,${row.image_base64}`
        : null,
      filename: row.filename || null
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
