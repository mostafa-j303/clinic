import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }


 const session = await requireAdmin(req, res);
  if (!session) return;


  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  const pool = getPool();

  try {
    await pool.query("DELETE FROM appointment_requests WHERE id = $1", [id]);
    return res.status(200).json({ message: "Request deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Delete failed" });
  }
}
