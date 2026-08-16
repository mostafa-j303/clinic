import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { setClientSuspended } from "../../../lib/repositories/clients";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { clientId, suspended } = req.body;
  if (!clientId || typeof suspended !== "boolean") {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await setClientSuspended(clientId, suspended);
    return res.status(200).json({ message: "Updated" });
  } catch (error) {
    console.error("Error suspending client:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
