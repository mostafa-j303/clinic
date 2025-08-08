// pages/api/delete-appointment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid appointment ID' });
  }

  try {
    const pool = connectToDatabase();

    await pool.query(
      `DELETE FROM appointment_details WHERE appointment_id = $1`,
      [id]
    );
    await pool.query(
      `DELETE FROM appointments WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
