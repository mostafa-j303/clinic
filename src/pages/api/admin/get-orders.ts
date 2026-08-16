import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from '../../../../lib/session';
import { listOrders } from '../../../lib/repositories/orders';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

  try {
    const orders = await listOrders();
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
}
