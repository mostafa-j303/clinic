const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_OWNER_NUMBER = process.env.WHATSAPP_OWNER_NUMBER;
const WHATSAPP_TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";

export type WhatsAppNotification = {
  /** One of the 4 approved per-event templates — see whatsappTemplates.ts */
  templateName: "order_notification" | "appointment_notification" | "intake_notification" | "registration_notification";
  /** {{1}} event title, {{2}} who, {{3}} details — the template body. */
  bodyParams: string[];
  /** The record id appended to the template's fixed-base URL button (e.g. "42" -> `.../Orders?id=42`). */
  buttonParam: string;
};

// Each of the 4 templates has a body (3 text placeholders) AND a dynamic URL
// button (1 placeholder — just the record id, appended to that template's
// own fixed base URL, configured on the template itself in Meta, not here).
export async function sendWhatsAppMessage(notification: WhatsAppNotification): Promise<void> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_OWNER_NUMBER) {
    // Throwing (not silently returning) matters here: every caller wraps
    // this in try/catch and logs via console.error, and the manual test
    // route (send-whatsapp.ts) reports whatever this function does back to
    // the caller as {success:true} on any non-throwing return — a silent
    // skip here previously looked identical to an actual successful send
    // from both the logs (a warn, not an error, easy to miss) and the API
    // response, which is exactly what made a real missing-env-var
    // misconfiguration in production indistinguishable from "it's working."
    const missing = [
      !WHATSAPP_TOKEN && "WHATSAPP_TOKEN",
      !WHATSAPP_PHONE_NUMBER_ID && "WHATSAPP_PHONE_NUMBER_ID",
      !WHATSAPP_OWNER_NUMBER && "WHATSAPP_OWNER_NUMBER",
    ].filter(Boolean);
    throw new Error(`WhatsApp not configured — missing env var(s): ${missing.join(", ")}`);
  }

  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: WHATSAPP_OWNER_NUMBER,
        type: "template",
        template: {
          name: notification.templateName,
          language: { code: WHATSAPP_TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: notification.bodyParams.map((text) => ({ type: "text", text })),
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: notification.buttonParam }],
            },
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(`WhatsApp send failed (${response.status}): ${JSON.stringify(data)}`);
  }
}
