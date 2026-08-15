import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../lib/db";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { orderWhatsAppParams } from "../../app/utils/whatsappTemplates";

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


  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Insert order
    const orderResult = await client.query(
      `
      INSERT INTO orders (name, last_name, phone, payment_method, address, location_link, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING id
      `,
      [name, lastName, phone, paymentMethod, address, locationLink]
    );

    const orderId = orderResult.rows[0].id;

    // 2️⃣ Insert order items
    for (const item of cart) {
      if (!item.id || !item.quantity) {
        throw new Error("Invalid cart item");
      }

      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity)
        VALUES ($1, $2, $3)
        `,
        [orderId, item.id, item.quantity]
      );
    }

    await client.query("COMMIT");

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
    await client.query("ROLLBACK");
    console.error("Database error:", error);

    return res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    client.release();
  }
}
