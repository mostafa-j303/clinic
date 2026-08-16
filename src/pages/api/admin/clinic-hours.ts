import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { updateClinicHours } from "../../../lib/repositories/clinicHours";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { hours } = req.body;
  if (!Array.isArray(hours) || hours.length !== 7) {
    return res.status(400).json({ message: "Expected 7 day entries" });
  }

  try {
    await updateClinicHours(hours);
    return res.status(200).json({ message: "Opening hours updated" });
  } catch (error: any) {
    console.error("Error updating clinic hours:", error);
    // Validation errors from updateClinicHours (e.g. a non-half-hour time)
    // are safe to surface directly — they're plain, non-sensitive messages.
    const message = error?.message?.includes("30-minute boundary")
      ? error.message
      : "Server error";
    return res.status(message === "Server error" ? 500 : 400).json({ message });
  }
}
