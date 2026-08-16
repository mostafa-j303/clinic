import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { scheduleRequestSlot } from "../../../lib/repositories/bookings";

// Admin assigns (and immediately confirms) a time for a request the client
// left unscheduled — "the admin can accept both" cases: client scheduled it
// themselves at booking time, or the admin finishes scheduling it for them.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id, slotStart } = req.body;
  if (!id || !slotStart) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await scheduleRequestSlot(id, slotStart, { asAdmin: true });

    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: "This request could not be found.",
        finalized: "This request already has a scheduled time or is no longer pending.",
        slot_taken: "That time is already confirmed for another client.",
      };
      return res.status(409).json({ message: messages[result.reason] });
    }

    return res.status(200).json({ message: "Visit scheduled and confirmed." });
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
