import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { getSession } from "../../../lib/session";
import { getAvailableSlots } from "../../lib/repositories/bookings";

// Logged-in clients (to book) or the admin (to schedule/manually create a
// booking) — matches the "must be logged in to book" rule; there's no reason
// to expose the live schedule to a fully anonymous visitor.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const clientSession = await getServerSession(req, res, authOptions);
  const adminSession = await getSession(req, res);
  if (!clientSession?.clientId && !adminSession?.isAdmin) {
    return res.status(401).json({ message: "Please log in to view available times." });
  }

  const { date } = req.query;
  if (!date || Array.isArray(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: "A valid date (YYYY-MM-DD) is required" });
  }

  try {
    const slots = await getAvailableSlots(date);
    return res.status(200).json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
