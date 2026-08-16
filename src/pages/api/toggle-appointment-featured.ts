import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/session";
import { toggleFeaturedAppointment } from "../../lib/repositories/appointments";

// Only one appointment package can be featured at a time — starring one
// un-stars any previously featured package.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Missing appointment id" });
  }

  try {
    const result = await toggleFeaturedAppointment(id);
    if (result.notFound) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(200).json({ message: "Updated", isFeatured: result.isFeatured });
  } catch (error) {
    console.error("Error toggling featured appointment:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
