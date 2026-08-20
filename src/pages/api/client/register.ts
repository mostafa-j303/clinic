import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { findClientByEmail, createClient } from "../../../lib/repositories/clients";
import { notifyNewRegistration } from "../../../lib/registrationNotification";

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

  const existing = await findClientByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 12);
  const clientId = await createClient({ email, passwordHash: hash, fullName });

  await notifyNewRegistration(clientId, fullName, email);

  return res.status(201).json({ message: "Account created. Please sign in." });
}
