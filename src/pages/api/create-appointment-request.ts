import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../lib/db";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { appointmentWhatsAppParams } from "../../app/utils/whatsappTemplates";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    firstName,
    lastName,
    phone,
    appointmentId,
    appointmentName,
    selectedDate,
    paymentMethod,
    priceUsed,
  } = req.body;

  // ✅ Required fields validation
  if (
    !firstName ||
    !lastName ||
    !phone ||
    !appointmentId ||
    !appointmentName ||
    !selectedDate ||
    !paymentMethod ||
    !priceUsed
  ) {
    console.log("Missing fields:", req.body);
    return res.status(400).json({ message: "Missing required fields" });
  }

  // ✅ Phone validation (international-safe)
  const phoneRegex = /^[0-9+\s]{6,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO appointment_requests
      (
        first_name,
        last_name,
        phone_number,
        appointment_id,
        appointment_name,
        selected_date,
        payment_method,
        price_used,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Pending')
      RETURNING id
      `,
      [
        firstName,
        lastName,
        phone,
        appointmentId,
        appointmentName,
        selectedDate,
        paymentMethod,
        priceUsed
      ]
    );

    await client.query("COMMIT");

    try {
      await sendWhatsAppMessage(
        appointmentWhatsAppParams(firstName, lastName, appointmentName, selectedDate)
      );
    } catch (whatsappError) {
      console.error("Error sending appointment WhatsApp notification:", whatsappError);
    }

    return res.status(200).json({
      message: "Appointment request created successfully",
      requestId: result.rows[0].id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error:", error);

    return res.status(500).json({
      message: "Failed to create appointment request",
    });
  } finally {
    client.release();
  }
}
