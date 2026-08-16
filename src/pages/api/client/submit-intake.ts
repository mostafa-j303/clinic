import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { generateIntakeEmailHTML, toWhatsAppLink } from "../../../app/utils/emailTemplates";
import { sendWhatsAppMessage } from "../../../lib/whatsapp";
import { intakeFormWhatsAppParams } from "../../../app/utils/whatsappTemplates";
import {
  getClientAccountInfo,
  getAdminNotificationSettings,
  intakeFormExistsForClient,
  insertIntakeForm,
  markProfileCompleted,
} from "../../../lib/repositories/clients";
import { getSiteUrl } from "../../../lib/siteUrl";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const f = req.body;

  try {
    const client = await getClientAccountInfo(session.clientId);
    const alreadySubmitted = await intakeFormExistsForClient(session.clientId);

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "You have already submitted the form",
      });
    }
    if (!f.fullName || !f.age || !f.gender || !f.reason || !f.currentWeight || !f.heightCm || !f.exercises || !f.usualWeight) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const intakeFormId = await insertIntakeForm(session.clientId, f);
    await markProfileCompleted(session.clientId, true);

    try {
      const { adminEmail, brandPrimary, brandAccent, siteUrl } = await getAdminNotificationSettings();

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
            to: [
              {
                email: adminEmail,
                name: "Admin",
              },
            ],
            subject: `New Intake Form Submission from ${f.fullName}`,
            htmlContent: generateIntakeEmailHTML({
              fullName: f.fullName,
              email: client?.email || session.user?.email || "-",
              phoneNumber: f.phoneNumber,
              age: String(f.age),
              gender: f.gender,
              occupation: f.occupation,
              reason: f.reason,
              currentWeight: String(f.currentWeight),
              heightCm: String(f.heightCm),
              usualWeight: String(f.usualWeight),
              exercises: f.exercises === "Yes" && f.exerciseDetails
                ? `Yes - ${f.exerciseDetails}`
                : f.exercises,
              brandPrimary,
              brandAccent,
              viewUrl: `${getSiteUrl(siteUrl)}/IntakeForms?id=${intakeFormId}`,
              whatsappUrl: toWhatsAppLink(f.phoneNumber),
            }),
          }),
        });
      }
    } catch (emailError) {
      console.error("Error sending intake form email:", emailError);
    }

    try {
      await sendWhatsAppMessage(intakeFormWhatsAppParams(f.fullName, f.reason, intakeFormId));
    } catch (whatsappError) {
      console.error("Error sending intake form WhatsApp notification:", whatsappError);
    }

    return res.status(200).json({ message: "Form submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
