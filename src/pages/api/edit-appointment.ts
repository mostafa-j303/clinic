import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/session';
import { updateAppointment } from '../../lib/repositories/appointments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

  const { id, name, price, offerprice, duration, details } = req.body;

  if (!id || !name || !price ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await updateAppointment({ id, name, price, offerprice, duration, details });
    res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
