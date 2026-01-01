import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const allowedStatuses = ["Pending", "Sent", "Cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    // 🔒 Get current status
    const currentRes = await client.query(
      "SELECT status FROM appointment_requests WHERE id = $1",
      [id]
    );

    if (currentRes.rowCount === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const currentStatus = currentRes.rows[0].status;

    // 🔒 Block invalid transitions
    if (currentStatus === "Cancelled") {
      return res.status(400).json({
        message: "This order is finalized and cannot be updated",
      });
    }

    await client.query(
      `UPDATE appointment_requests SET status = $1 WHERE id = $2`,
      [status, id]
    );

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Failed to update status" });
  } finally {
    client.release();
  }
}
