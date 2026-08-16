import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

  const pool = getPool();

  try {
    const result = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        phone_number,
        appointment_name,
        selected_date,
        slot_start,
        payment_method,
        price_used,
        status,
        created_at
      FROM appointment_requests
      ORDER BY created_at DESC
    `);

    return res.status(200).json({ requests: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
}
