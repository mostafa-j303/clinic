import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { listClientsForAdmin } from "../../../lib/repositories/clients";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const session = await requireAdmin(req, res);
  if (!session) return;

  const clients = await listClientsForAdmin();

  return res.status(200).json({ clients });
}
