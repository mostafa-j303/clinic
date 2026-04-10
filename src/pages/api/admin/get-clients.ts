import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { connectToDatabase } from "../../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const session = await requireAdmin(req, res);
  if (!session) return;

  const pool = connectToDatabase();
  const result = await pool.query(`
    SELECT
      c.id, c.email, c.full_name, c.profile_completed, c.created_at,
      f.age, f.gender, f.phone_number, f.current_weight, f.height_cm,
      f.goals, f.medical_conditions, f.readiness_scale
    FROM clients c
    LEFT JOIN client_intake_forms f ON f.client_id = c.id
    ORDER BY c.created_at DESC
  `);

  return res.status(200).json({ clients: result.rows });
}