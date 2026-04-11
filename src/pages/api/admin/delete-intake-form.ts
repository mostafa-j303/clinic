import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/session";
import { getPool } from "../../../../lib/db";

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

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const formResult = await client.query(
      "SELECT client_id FROM client_intake_forms WHERE id = $1",
      [intakeFormId]
    );

    if (formResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Intake form not found" });
    }

    const clientId = formResult.rows[0].client_id;

    await client.query("DELETE FROM client_intake_forms WHERE id = $1", [
      intakeFormId,
    ]);

    await client.query(
      "UPDATE clients SET profile_completed = false WHERE id = $1",
      [clientId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Intake form deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete intake form error:", error);
    return res.status(500).json({ message: "Failed to delete intake form" });
  } finally {
    client.release();
  }
}
