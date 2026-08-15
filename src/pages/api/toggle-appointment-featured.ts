import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/db";
import { requireAdmin } from "../../../lib/session";

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

  const pool = connectToDatabase();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT is_featured FROM appointments WHERE id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Appointment not found" });
    }

    const willBeFeatured = !current.rows[0].is_featured;

    await client.query("UPDATE appointments SET is_featured = false");
    if (willBeFeatured) {
      await client.query("UPDATE appointments SET is_featured = true WHERE id = $1", [id]);
    }

    await client.query("COMMIT");
    return res.status(200).json({ message: "Updated", isFeatured: willBeFeatured });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error toggling featured appointment:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}
