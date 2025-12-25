import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(
      "DELETE FROM orders WHERE id = $1",
      [orderId]
    );

    return res.status(200).json({
      message: "Order and related items deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      message: "Failed to delete order",
    });
  } finally {
    client.release();
  }
}
