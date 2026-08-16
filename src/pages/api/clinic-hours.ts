import type { NextApiRequest, NextApiResponse } from "next";
import { listClinicHours } from "../../lib/repositories/clinicHours";

// Public — the booking calendar needs to know which days/hours are open
// without requiring a login just to see the schedule.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const hours = await listClinicHours();
    return res.status(200).json({ hours });
  } catch (error) {
    console.error("Error fetching clinic hours:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
