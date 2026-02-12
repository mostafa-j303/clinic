import type { NextApiRequest, NextApiResponse } from "next";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, subject, htmlContent, recipientName } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: to,
            name: recipientName || "Admin",
          },
        ],
        subject,
        htmlContent,
      }),
    });

    const data = await response.json();
   
    if (!response.ok) {
      console.error("Brevo error:", data);
      return res.status(500).json(data);
    }

    return res.status(200).json({
      success: true,
      messageId: data.messageId,
    });
  } catch (error) {
    console.error("Send email error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
