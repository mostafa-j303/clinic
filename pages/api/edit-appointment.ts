import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, name, price, offerPrice, duration, details } = req.body;

  if (!id || !name || !price ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = connectToDatabase();

    await pool.query(
      `
        UPDATE appointments
        SET name = $1, price = $2, offer_price = $3, duration = $4
        WHERE id = $5
      `,
      [name, price, offerPrice, duration, id]
    );

    // Clear existing details
    await pool.query(
      `
        DELETE FROM appointment_details
        WHERE appointment_id = $1
      `,
      [id]
    );

    // Insert new details
    if (Array.isArray(details) && details.length > 0) {
      const insertDetailsPromises = details.map((detail: string) =>
        pool.query(
          `
            INSERT INTO appointment_details (appointment_id, detail)
            VALUES ($1, $2)
          `,
          [id, detail]
        )
      );
      await Promise.all(insertDetailsPromises);
    }

    res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
