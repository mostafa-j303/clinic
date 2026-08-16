import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { deleteClientHard } from "../../../lib/repositories/clients";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { clientId } = req.body;
  if (!clientId) {
    return res.status(400).json({ message: "Missing clientId" });
  }

  try {
    const { notFound } = await deleteClientHard(clientId);
    if (notFound) {
      return res.status(404).json({ message: "Client not found" });
    }
    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
