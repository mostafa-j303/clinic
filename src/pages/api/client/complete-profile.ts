import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { updateClientBasicInfo } from "../../../lib/repositories/clients";

const ALLOWED_GENDERS = ["Female", "Male", "Prefer not to say"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "You must be logged in" });
  }

  const { phoneNumber, gender } = req.body;
  if (!phoneNumber || typeof phoneNumber !== "string" || !phoneNumber.trim()) {
    return res.status(400).json({ message: "Phone number is required" });
  }
  if (!gender || !ALLOWED_GENDERS.includes(gender)) {
    return res.status(400).json({ message: "A valid gender selection is required" });
  }

  try {
    await updateClientBasicInfo(session.clientId, {
      phoneNumber: phoneNumber.trim(),
      gender,
    });
    return res.status(200).json({ message: "Profile updated" });
  } catch (error) {
    console.error("Error completing client profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
