import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { closeDay, openDay, closeSlot, openSlot } from "../../../lib/repositories/closures";

// Closes or reopens either a whole day or a single 30-min slot to new
// bookings. Closing a specific slot that already has a Confirmed booking is
// refused — cancel that booking first if it really needs to be blocked.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { date, slotTime, close } = req.body;
  if (!date || typeof close !== "boolean") {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    if (slotTime) {
      if (close) {
        const result = await closeSlot(date, slotTime);
        if (!result.ok) {
          return res.status(409).json({
            message: "That time is already confirmed for a client. Cancel the booking first if you need to close it.",
          });
        }
      } else {
        await openSlot(date, slotTime);
      }
    } else {
      if (close) {
        await closeDay(date);
      } else {
        await openDay(date);
      }
    }

    return res.status(200).json({ message: "Updated" });
  } catch (error) {
    console.error("Error toggling closure:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
