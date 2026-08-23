import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/session";
import { setAppointmentTier, FeaturedTier } from "../../lib/repositories/appointments";

const VALID_TIERS: FeaturedTier[] = ["gold", "silver", "bronze"];

// Only one package can hold a given tier (gold/silver/bronze) at a time —
// setting one on a package clears it from whichever other package
// previously held that same tier.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id, tier } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Missing appointment id" });
  }
  if (tier !== null && !VALID_TIERS.includes(tier)) {
    return res.status(400).json({ message: `tier must be one of ${VALID_TIERS.join(", ")} or null` });
  }

  try {
    const result = await setAppointmentTier(id, tier);
    if (result.notFound) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(200).json({ message: "Updated", tier: result.tier });
  } catch (error) {
    console.error("Error setting appointment tier:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
