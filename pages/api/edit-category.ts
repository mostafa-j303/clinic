import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, name } = req.body;

  if (!id || !name) return res.status(400).json({ error: "Missing category ID or name" });

  try {
    const pool = getPool();
    await pool.query("UPDATE categories SET name = $1 WHERE id = $2", [name, id]);
    res.status(200).json({ message: "Category updated" });
  } catch (error) {
    console.error("Edit category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
