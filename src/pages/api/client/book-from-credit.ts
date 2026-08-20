import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { createAppointmentFromCredit } from "../../../lib/repositories/bookings";
import { sendWhatsAppMessage } from "../../../lib/whatsapp";
import { sendTelegramMessage } from "../../../lib/telegram";
import { appointmentWhatsAppParams } from "../../../app/utils/whatsappTemplates";
import { generateAppointmentEmailHTML, toWhatsAppLink } from "../../../app/utils/emailTemplates";
import { getAdminNotificationSettings } from "../../../lib/repositories/clients";
import { getSiteUrl } from "../../../lib/siteUrl";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

// The client-facing "book an appointment" page — spends one visit from an
// already-approved package credit on a specific time. Leaves the new
// request Pending, same as any other booking; the admin still confirms it.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "Please log in." });
  }

  const { creditId, slotStart, firstName, lastName, phone } = req.body;
  if (!creditId || !slotStart || !firstName || !lastName || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await createAppointmentFromCredit({
      clientId: session.clientId,
      creditId,
      slotStart,
      firstName,
      lastName,
      phone,
    });

    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: "That package credit could not be found.",
        no_credits: "You have no remaining visits on this package.",
        expired: "This package's validity period has expired.",
        slot_unavailable: "That time was just booked by someone else. Please pick another slot.",
      };
      return res.status(409).json({ message: messages[result.reason] });
    }

    const dateLabel = new Date(slotStart).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      await sendWhatsAppMessage(
        appointmentWhatsAppParams(firstName, lastName, result.appointmentName, dateLabel, result.requestId)
      );
    } catch (whatsappError) {
      console.error("Error sending appointment WhatsApp notification:", whatsappError);
    }

    try {
      const { siteUrl } = await getAdminNotificationSettings();
      await sendTelegramMessage({
        title: "New Appointment Request",
        lines: [
          `Client: ${firstName} ${lastName}`,
          `Phone: ${phone}`,
          `Appointment: ${result.appointmentName}`,
          `Date: ${dateLabel}`,
          `Price: ${result.priceUsed}`,
          `Payment: Package Credit`,
        ],
        buttons: [
          { text: "View in Admin Panel", url: `${getSiteUrl(siteUrl)}/Appointments?id=${result.requestId}` },
          { text: "Contact via WhatsApp", url: toWhatsAppLink(phone) },
        ],
      });
    } catch (telegramError) {
      console.error("Error sending appointment Telegram notification:", telegramError);
    }

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
            sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
            to: [{ email: adminEmail, name: "Admin" }],
            subject: `New Appointment Booking from ${firstName} ${lastName}`,
            htmlContent: generateAppointmentEmailHTML({
              customerName: `${firstName} ${lastName}`,
              customerPhone: phone,
              appointmentName: result.appointmentName,
              appointmentDate: dateLabel,
              price: result.priceUsed,
              paymentMethod: "Package Credit",
              brandPrimary,
              brandAccent,
              viewUrl: `${getSiteUrl(siteUrl)}/Appointments?id=${result.requestId}`,
              whatsappUrl: toWhatsAppLink(phone),
            }),
          }),
        });
      }
    } catch (emailError) {
      console.error("Error sending appointment email:", emailError);
    }

    return res.status(200).json({ message: "Appointment requested — awaiting confirmation.", requestId: result.requestId });
  } catch (error) {
    console.error("Error booking from credit:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
