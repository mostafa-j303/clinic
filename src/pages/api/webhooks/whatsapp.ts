import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

// Body parsing must be disabled so we can verify Meta's HMAC signature
// against the exact raw request bytes — Next's default JSON parsing would
// re-serialize the body, producing a different byte sequence and always
// failing signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Meta's WhatsApp Cloud API webhook — handles both the one-time GET
// verification handshake (when you paste the callback URL into WhatsApp
// Manager) and the ongoing POST delivery-status events (sent/delivered/
// read/failed) for messages this app has sent. This is what finally gives
// real per-message delivery visibility, instead of only ever seeing
// "accepted" from the send call itself (see CLAUDE.md's WhatsApp entries —
// "accepted" only means Meta queued it, not that it reached the recipient).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN && VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    const rawBody = await readRawBody(req);

    if (APP_SECRET) {
      const signature = req.headers["x-hub-signature-256"];
      const expected =
        "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
      if (signature !== expected) {
        return res.status(401).send("Invalid signature");
      }
    } else {
      console.warn("WHATSAPP_APP_SECRET not set — skipping webhook signature verification");
    }

    try {
      const body = JSON.parse(rawBody);
      const statuses = body?.entry?.[0]?.changes?.[0]?.value?.statuses;

      if (Array.isArray(statuses)) {
        for (const s of statuses) {
          // s.status is one of: sent | delivered | read | failed
          console.log(
            `[whatsapp webhook] message ${s.id} -> ${s.status}`,
            s.errors ? JSON.stringify(s.errors) : ""
          );
        }
      }
    } catch (err) {
      console.error("Error parsing WhatsApp webhook payload:", err);
    }

    // Meta requires a fast 200 response regardless of what we did with the
    // payload, or it'll retry (and eventually stop sending events).
    return res.status(200).send("OK");
  }

  return res.status(405).send("Method Not Allowed");
}
