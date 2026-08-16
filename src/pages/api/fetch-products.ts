// pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { listProductsWithCategories } from '../../lib/repositories/products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { products, categories } = await listProductsWithCategories();
    res.status(200).json({ products, categories });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
