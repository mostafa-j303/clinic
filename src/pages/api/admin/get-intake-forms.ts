import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { listIntakeFormsFull } from "../../../lib/repositories/clients";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  try {
    const intakeForms = await listIntakeFormsFull();
    return res.status(200).json({ intakeForms });
  } catch (error) {
    console.error("Error fetching intake forms:", error);
    return res.status(500).json({ message: "Failed to fetch intake forms" });
  }
}
