import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { deleteIntakeForm } from "../../../lib/repositories/clients";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { intakeFormId } = req.body;

  if (!intakeFormId) {
    return res.status(400).json({ message: "Intake form ID is required" });
  }

  try {
    const { notFound } = await deleteIntakeForm(intakeFormId);

    if (notFound) {
      return res.status(404).json({ message: "Intake form not found" });
    }

    return res.status(200).json({
      message: "Intake form deleted successfully",
    });
  } catch (error) {
    console.error("Delete intake form error:", error);
    return res.status(500).json({ message: "Failed to delete intake form" });
  }
}
