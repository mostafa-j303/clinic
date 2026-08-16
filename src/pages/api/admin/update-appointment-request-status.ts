import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import {
  confirmBookingRequest,
  cancelBookingRequest,
  completeBookingRequest,
} from "../../../lib/repositories/bookings";

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Appointment not found",
  finalized: "This request is already finalized and cannot be updated",
  slot_taken: "That time slot was already confirmed for another client",
};

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

  const allowedStatuses = ["Confirmed", "Cancelled", "Completed"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const result =
      status === "Confirmed"
        ? await confirmBookingRequest(id)
        : status === "Completed"
        ? await completeBookingRequest(id)
        : await cancelBookingRequest(id);

    if (!result.ok) {
      const message = REASON_MESSAGES[result.reason] || "Unable to update status";
      const statusCode = result.reason === "not_found" ? 404 : 400;
      return res.status(statusCode).json({ message });
    }

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
}
