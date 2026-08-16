import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { updateOrderStatus } from '../../../lib/repositories/orders';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const allowedStatuses = ["Pending", "Sent", "Delivered", "Cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const { result } = await updateOrderStatus(orderId, status);

    if (result === "not_found") {
      return res.status(404).json({ message: "Order not found" });
    }
    if (result === "finalized") {
      return res.status(400).json({
        message: "This order is finalized and cannot be updated",
      });
    }

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
}
