import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { appointmentWhatsAppParams } from "../../app/utils/whatsappTemplates";
import { generateAppointmentEmailHTML, toWhatsAppLink } from "../../app/utils/emailTemplates";
import { createBookingRequest } from "../../lib/repositories/bookings";
import { getAdminNotificationSettings } from "../../lib/repositories/clients";
import { getSiteUrl } from "../../lib/siteUrl";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Booking requires a logged-in client account.
  const session = await getServerSession(req, res, authOptions);
  if (!session?.clientId) {
    return res.status(401).json({ message: "Please log in to book an appointment." });
  }

  const {
    firstName,
    lastName,
    phone,
    appointmentId,
    appointmentName,
    slotStart,
    paymentMethod,
    priceUsed,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !appointmentId ||
    !appointmentName ||
    !paymentMethod ||
    !priceUsed
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const phoneRegex = /^[0-9+\s]{6,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  try {
    const result = await createBookingRequest({
      clientId: session.clientId,
      firstName,
      lastName,
      phone,
      appointmentId,
      appointmentName,
      slotStart,
      paymentMethod,
      priceUsed,
    });

    if (!result.ok) {
      const messages: Record<string, string> = {
        no_credits: "You have no remaining visits on this package. Please purchase a new package.",
        slot_unavailable: "That time was just booked by someone else. Please pick another slot.",
        package_not_found: "This appointment package no longer exists.",
      };
      return res.status(409).json({ message: messages[result.reason] });
    }

    const dateLabel = slotStart
      ? new Date(slotStart).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Package request — awaiting approval, no time booked yet";

    try {
      await sendWhatsAppMessage(
        appointmentWhatsAppParams(firstName, lastName, appointmentName, dateLabel)
      );
    } catch (whatsappError) {
      console.error("Error sending appointment WhatsApp notification:", whatsappError);
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
              appointmentName,
              appointmentDate: dateLabel,
              price: priceUsed,
              paymentMethod,
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

    return res.status(200).json({
      message: slotStart
        ? "Appointment request created successfully"
        : "Package request sent — we'll confirm it and credit your visits soon.",
      requestId: result.requestId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      message: "Failed to create appointment request",
    });
  }
}
