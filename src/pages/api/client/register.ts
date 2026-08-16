import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { sendWhatsAppMessage } from "../../../lib/whatsapp";
import { registrationWhatsAppParams } from "../../../app/utils/whatsappTemplates";
import { generateRegistrationEmailHTML } from "../../../app/utils/emailTemplates";
import { findClientByEmail, createClient, getAdminNotificationSettings } from "../../../lib/repositories/clients";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

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
  await createClient({ email, passwordHash: hash, fullName });

  try {
    await sendWhatsAppMessage(registrationWhatsAppParams(fullName, email));
  } catch (whatsappError) {
    console.error("Error sending registration WhatsApp notification:", whatsappError);
  }

  try {
    const { adminEmail, brandPrimary, brandAccent } = await getAdminNotificationSettings();

    if (adminEmail && BREVO_API_KEY) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
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
          to: [{ email: adminEmail, name: "Admin" }],
          subject: `New Client Registration: ${fullName}`,
          htmlContent: generateRegistrationEmailHTML({ fullName, email, brandPrimary, brandAccent }),
        }),
      });
    }
  } catch (emailError) {
    console.error("Error sending registration email:", emailError);
  }

  return res.status(201).json({ message: "Account created. Please sign in." });
}
