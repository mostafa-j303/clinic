import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../lib/db";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const pool = connectToDatabase();

  const existing = await pool.query(
    "SELECT id FROM clients WHERE email = $1",
    [email]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO clients (email, password_hash, full_name, profile_completed)
     VALUES ($1, $2, $3, false)`,
    [email, hash, fullName]
  );

  return res.status(201).json({ message: "Account created. Please sign in." });
}