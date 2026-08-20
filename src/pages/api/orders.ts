import type { NextApiRequest, NextApiResponse } from "next";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { sendTelegramMessage } from "../../lib/telegram";
import { orderWhatsAppParams } from "../../app/utils/whatsappTemplates";
import { toWhatsAppLink } from "../../app/utils/emailTemplates";
import { createOrder, getOrderItemsSummary } from "../../lib/repositories/orders";
import { getAdminNotificationSettings } from "../../lib/repositories/clients";
import { getSiteUrl } from "../../lib/siteUrl";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {name, lastName, phone, paymentMethod, address, locationLink, cart } = req.body;

  if (!name || !lastName || !phone || !paymentMethod || !address || !locationLink || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const phoneRegex = /^[0-9+\s]{6,20}$/;
if (!phoneRegex.test(phone)) {
  return res.status(400).json({ message: "Invalid phone number" });
}

  try {
    const orderId = await createOrder({ name, lastName, phone, paymentMethod, address, locationLink, cart });

    try {
      await sendWhatsAppMessage(orderWhatsAppParams(name, lastName, orderId, cart.length));
    } catch (whatsappError) {
      console.error("Error sending order WhatsApp notification:", whatsappError);
    }

    try {
      const [{ siteUrl }, items] = await Promise.all([
        getAdminNotificationSettings(),
        getOrderItemsSummary(orderId),
      ]);
      const itemLines = items.map((item) => `• ${item.name} x${item.quantity} (${item.price})`);
      await sendTelegramMessage({
        title: `New Order #${orderId}`,
        lines: [
          `Customer: ${name} ${lastName}`,
          `Phone: ${phone}`,
          `Payment: ${paymentMethod}`,
          `Address: ${address}`,
          "",
          "Items:",
          ...itemLines,
        ],
        buttons: [
          { text: "View in Admin Panel", url: `${getSiteUrl(siteUrl)}/Orders?id=${orderId}` },
          { text: "Visit Website", url: getSiteUrl(siteUrl) },
          { text: "Contact via WhatsApp", url: toWhatsAppLink(phone) },
          { text: "Delivery Location", url: locationLink },
        ],
      });
    } catch (telegramError) {
      console.error("Error sending order Telegram notification:", telegramError);
    }

    return res.status(200).json({
      message: "Order created successfully",
      orderId,
    });
  } catch (error) {
    console.error("Database error:", error);

    return res.status(500).json({
      message: "Failed to create order",
    });
  }
}
