// pages/api/delete-appointment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/session';
import { deleteAppointment } from '../../lib/repositories/appointments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

 const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid appointment ID' });
  }

  try {
    await deleteAppointment(id);
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
