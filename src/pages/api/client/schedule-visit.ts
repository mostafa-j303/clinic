import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { scheduleRequestSlot } from "../../../lib/repositories/bookings";

// Lets a client pick a time for a package they chose earlier without
// scheduling a visit yet (see Appointment.tsx's "schedule my first visit
// now" checkbox). Leaves the request Pending — same as any other booking,
// the admin still confirms it.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "Please log in." });
  }

  const { requestId, slotStart } = req.body;
  if (!requestId || !slotStart) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await scheduleRequestSlot(requestId, slotStart, {
      clientId: session.clientId,
    });

    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: "This request could not be found.",
        finalized: "This request already has a scheduled time or is no longer pending.",
        slot_taken: "That time was just booked by someone else. Please pick another slot.",
      };
      return res.status(409).json({ message: messages[result.reason] });
    }

    return res.status(200).json({ message: "Visit scheduled — awaiting confirmation." });
  } catch (error) {
    console.error("Error scheduling visit:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
