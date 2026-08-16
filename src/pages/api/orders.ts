import type { NextApiRequest, NextApiResponse } from "next";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { orderWhatsAppParams } from "../../app/utils/whatsappTemplates";
import { createOrder } from "../../lib/repositories/orders";

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
