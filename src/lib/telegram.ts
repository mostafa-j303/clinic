const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export type TelegramButton = { text: string; url: string | undefined };

export type TelegramNotification = {
  title: string;
  /** Each string becomes its own line in the message. */
  lines: string[];
  /** e.g. "View in Admin Panel", "Contact via WhatsApp" — filtered to valid https links only. */
  buttons?: TelegramButton[];
};

// Free, no-daily-limit admin notification channel — adopted alongside email
// after WhatsApp business-initiated messages turned out to require a
// payment method on the WABA (see CLAUDE.md's WhatsApp entries). Every
// caller wraps this in try/catch, same as sendWhatsAppMessage.
export async function sendTelegramMessage(notification: TelegramNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    const missing = [
      !TELEGRAM_BOT_TOKEN && "TELEGRAM_BOT_TOKEN",
      !TELEGRAM_CHAT_ID && "TELEGRAM_CHAT_ID",
    ].filter(Boolean);
    throw new Error(`Telegram not configured — missing env var(s): ${missing.join(", ")}`);
  }

  const text = `*${notification.title}*\n${notification.lines.join("\n")}`;

  // Telegram rejects non-HTTPS button URLs outright — during local dev,
  // NEXTAUTH_URL is http://localhost, which would otherwise fail the whole
  // send (not just drop that one button). Drop invalid ones individually
  // rather than the whole reply_markup, since a WhatsApp link may be valid
  // while the admin-panel link isn't (or vice versa).
  const validButtons = (notification.buttons || []).filter(
    (b): b is { text: string; url: string } => !!b.url && b.url.startsWith("https://")
  );
  // Telegram allows at most 8 buttons per row; one per row keeps them tappable.
  const inline_keyboard = validButtons.map((b) => [{ text: b.text, url: b.url }]);

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
      reply_markup: inline_keyboard.length ? { inline_keyboard } : undefined,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(`Telegram send failed (${response.status}): ${JSON.stringify(data)}`);
  }
}

// Sends a file (e.g. the intake form PDF) as its own message via Telegram's
// sendDocument endpoint, which needs multipart/form-data — unlike
// sendMessage above, this can't just be JSON.
export async function sendTelegramDocument(
  buffer: Buffer,
  filename: string,
  caption?: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    const missing = [
      !TELEGRAM_BOT_TOKEN && "TELEGRAM_BOT_TOKEN",
      !TELEGRAM_CHAT_ID && "TELEGRAM_CHAT_ID",
    ].filter(Boolean);
    throw new Error(`Telegram not configured — missing env var(s): ${missing.join(", ")}`);
  }

  const form = new FormData();
  form.append("chat_id", TELEGRAM_CHAT_ID);
  if (caption) form.append("caption", caption);
  form.append("document", new Blob([new Uint8Array(buffer)], { type: "application/pdf" }), filename);

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(`Telegram document send failed (${response.status}): ${JSON.stringify(data)}`);
  }
}
