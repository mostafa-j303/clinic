import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getClientCredits } from "../../../lib/repositories/bookings";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) return res.status(401).json({ message: "Unauthorized" });

  const credits = await getClientCredits(session.clientId);
  return res.status(200).json({ credits });
}
