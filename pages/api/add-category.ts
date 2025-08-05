import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Missing category name" });

  try {
    const pool = getPool();
    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.status(200).json({ message: "Category added" });
  } catch (error) {
    console.error("Add category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
