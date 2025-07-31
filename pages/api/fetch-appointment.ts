// pages/api/appointments.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = connectToDatabase();

    const result = await pool.query(`
     SELECT * FROM get_appointments()
    `);
//     const result = await pool.query(` 
//         SELECT 
//         a.id,
//         a.price,
//         a.offer_price AS "offerPrice",
//         a.name,
//         a.duration,
//         COALESCE(json_agg(ad.detail) FILTER (WHERE ad.detail IS NOT NULL), '[]') AS details
//       FROM appointments a
//       LEFT JOIN appointment_details ad ON a.id = ad.appointment_id
//       GROUP BY a.id, a.price, a.offer_price, a.name, a.duration
//  `);
    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
   