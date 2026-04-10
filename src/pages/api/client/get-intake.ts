import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) return res.status(401).json({ message: "Unauthorized" });

  const pool = connectToDatabase();
  const result = await pool.query(
    "SELECT * FROM client_intake_forms WHERE client_id = $1",
    [session.clientId]
  );

  return res.status(200).json({
    form: result.rows[0] || null,
    profileCompleted: session.profileCompleted,
  });
}