import type { NextApiRequest, NextApiResponse } from "next";
import { sendWhatsAppMessage } from "../../lib/whatsapp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { params } = req.body;

    if (!Array.isArray(params) || params.length !== 3) {
      return res.status(400).json({ error: "params must be an array of 3 strings" });
    }

    await sendWhatsAppMessage(params);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send WhatsApp error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
