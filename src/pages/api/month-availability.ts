import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { getSession } from "../../../lib/session";
import { getMonthAvailability } from "../../lib/repositories/bookings";

// Same auth rule as appointment-slots.ts: logged-in client or admin only.
// Powers the booking calendar's month grid — day-level only (no client
// names/details, just "has at least one open slot or not").
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const clientSession = await getServerSession(req, res, authOptions);
  const adminSession = await getSession(req, res);
  if (!clientSession?.clientId && !adminSession?.isAdmin) {
    return res.status(401).json({ message: "Please log in to view available times." });
  }

  const { year, month } = req.query;
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (
    !year ||
    !month ||
    Array.isArray(year) ||
    Array.isArray(month) ||
    !Number.isInteger(yearNum) ||
    !Number.isInteger(monthNum) ||
    monthNum < 1 ||
    monthNum > 12
  ) {
    return res.status(400).json({ message: "A valid year and month (1-12) are required" });
  }

  try {
    const availability = await getMonthAvailability(yearNum, monthNum);
    return res.status(200).json({ availability });
  } catch (error) {
    console.error("Error fetching month availability:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
