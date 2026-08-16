import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { createAppointmentFromCredit } from "../../../lib/repositories/bookings";

// The client-facing "book an appointment" page — spends one visit from an
// already-approved package credit on a specific time. Leaves the new
// request Pending, same as any other booking; the admin still confirms it.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "Please log in." });
  }

  const { creditId, slotStart, firstName, lastName, phone } = req.body;
  if (!creditId || !slotStart || !firstName || !lastName || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await createAppointmentFromCredit({
      clientId: session.clientId,
      creditId,
      slotStart,
      firstName,
      lastName,
      phone,
    });

    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: "That package credit could not be found.",
        no_credits: "You have no remaining visits on this package.",
        expired: "This package's validity period has expired.",
        slot_unavailable: "That time was just booked by someone else. Please pick another slot.",
      };
      return res.status(409).json({ message: messages[result.reason] });
    }

    return res.status(200).json({ message: "Appointment requested — awaiting confirmation.", requestId: result.requestId });
  } catch (error) {
    console.error("Error booking from credit:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
