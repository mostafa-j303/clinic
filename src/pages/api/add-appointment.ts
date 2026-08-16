import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/session';
import { createAppointment } from '../../lib/repositories/appointments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

  const { name, price, offerprice, duration, details } = req.body;

  if (!name || !price ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const appointmentId = await createAppointment({ name, price, offerprice, duration, details });
    res.status(201).json({ message: 'Appointment added successfully', id: appointmentId });
  } catch (error) {
    console.error('Error adding appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
