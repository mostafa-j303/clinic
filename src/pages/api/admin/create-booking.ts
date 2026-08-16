import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { createBookingRequest, confirmBookingRequest } from "../../../lib/repositories/bookings";

// Lets the admin place an appointment directly — a walk-in or phone booking
// — for an existing registered client, skipping the public booking flow
// entirely. Goes straight to Confirmed (reusing confirmBookingRequest so the
// same slot-clash re-check and "cancel other pending requests for this
// slot" cleanup runs as any other confirm).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const {
    clientId,
    firstName,
    lastName,
    phone,
    appointmentId,
    appointmentName,
    slotStart,
    paymentMethod,
    priceUsed,
  } = req.body;

  if (
    !clientId ||
    !firstName ||
    !lastName ||
    !phone ||
    !appointmentId ||
    !appointmentName ||
    !slotStart ||
    !paymentMethod ||
    !priceUsed
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const created = await createBookingRequest({
      clientId,
      firstName,
      lastName,
      phone,
      appointmentId,
      appointmentName,
      slotStart,
      paymentMethod,
      priceUsed,
    });

    if (!created.ok) {
      const messages: Record<string, string> = {
        no_credits: "This client has no remaining visits on this package.",
        slot_unavailable: "That time is already confirmed for another client.",
        package_not_found: "This appointment package no longer exists.",
      };
      return res.status(409).json({ message: messages[created.reason] });
    }

    const confirmed = await confirmBookingRequest(created.requestId);
    if (!confirmed.ok) {
      return res.status(409).json({ message: "Booking created but could not be auto-confirmed — confirm it from the list." });
    }

    return res.status(200).json({ message: "Booking created and confirmed", requestId: created.requestId });
  } catch (error) {
    console.error("Error creating admin booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
