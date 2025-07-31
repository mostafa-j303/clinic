// pages/api/check-admin.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (session.isAdmin) {
    res.status(200).json({ isAdmin: true });
  } else {
    res.status(200).json({ isAdmin: false });
  }
}
