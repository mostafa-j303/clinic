import type { NextApiRequest, NextApiResponse } from "next";
import { sendWhatsAppMessage, WhatsAppNotification } from "../../lib/whatsapp";

const VALID_TEMPLATES: WhatsAppNotification["templateName"][] = [
  "order_notification",
  "appointment_notification",
  "intake_notification",
  "registration_notification",
];

// Manual test endpoint — e.g.
// { "templateName": "order_notification", "params": ["Test", "Test", "Test"], "buttonParam": "1" }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { templateName, params, buttonParam } = req.body;

    if (!VALID_TEMPLATES.includes(templateName)) {
      return res.status(400).json({ error: `templateName must be one of: ${VALID_TEMPLATES.join(", ")}` });
    }
    if (!Array.isArray(params) || params.length !== 3) {
      return res.status(400).json({ error: "params must be an array of 3 strings" });
    }
    if (!buttonParam) {
      return res.status(400).json({ error: "buttonParam (the record id for the button) is required" });
    }

    await sendWhatsAppMessage({ templateName, bodyParams: params, buttonParam: String(buttonParam) });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send WhatsApp error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
