// pages/api/delete-product.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/session';
import { deleteProduct } from '../../lib/repositories/products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
 const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid or missing product ID' });
  }

  try {
    await deleteProduct(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
