import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, price, offerPrice, duration, details } = req.body;

  if (!name || !price ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = connectToDatabase();

    const insertAppointment = await pool.query(
      `
        INSERT INTO appointments (name, price, offer_price, duration)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [name, price, offerPrice, duration]
    );

    const appointmentId = insertAppointment.rows[0].id;

    // Insert details if they exist
    if (Array.isArray(details) && details.length > 0) {
      const insertDetailsPromises = details.map((detail: string) =>
        pool.query(
          `
            INSERT INTO appointment_details (appointment_id, detail)
            VALUES ($1, $2)
          `,
          [appointmentId, detail]
        )
      );
      await Promise.all(insertDetailsPromises);
    }

    res.status(201).json({ message: 'Appointment added successfully', id: appointmentId });
  } catch (error) {
    console.error('Error adding appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
