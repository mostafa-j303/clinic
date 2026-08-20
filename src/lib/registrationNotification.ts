import { sendWhatsAppMessage } from "./whatsapp";
import { registrationWhatsAppParams } from "../app/utils/whatsappTemplates";
import { generateRegistrationEmailHTML } from "../app/utils/emailTemplates";
import { getAdminNotificationSettings } from "./repositories/clients";
import { getSiteUrl } from "./siteUrl";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@yourapp.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Your Business";

// Shared by both signup paths — credentials registration (register.ts) and a
// first-time Google sign-in (nextauth's signIn callback), which used to
// create the client row directly with no notification at all, unlike every
// other "a new X happened" event in this app.
export async function notifyNewRegistration(clientId: number, fullName: string, email: string) {
  try {
    await sendWhatsAppMessage(registrationWhatsAppParams(fullName, email, clientId));
  } catch (whatsappError) {
    console.error("Error sending registration WhatsApp notification:", whatsappError);
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
          subject: `New Client Registration: ${fullName}`,
          htmlContent: generateRegistrationEmailHTML({
            fullName,
            email,
            brandPrimary,
            brandAccent,
            viewUrl: `${getSiteUrl(siteUrl)}/Users?id=${clientId}`,
          }),
        }),
      });
    }
  } catch (emailError) {
    console.error("Error sending registration email:", emailError);
  }
}
