import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { getDaySchedule } from "../../../lib/repositories/bookings";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { date } = req.query;
  if (!date || Array.isArray(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: "A valid date (YYYY-MM-DD) is required" });
  }

  try {
    const schedule = await getDaySchedule(date);
    return res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching day schedule:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
