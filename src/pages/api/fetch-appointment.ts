import type { NextApiRequest, NextApiResponse } from 'next';
import { listAppointments } from '../../lib/repositories/appointments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const appointments = await listAppointments();
    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
