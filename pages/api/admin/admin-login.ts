// pages/api/admin-login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '../../../lib/session';
import { poolPromise } from '../../../lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.query('SELECT passwordhash FROM admin LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No admin user found' });
    }

    const isMatch = await bcrypt.compare(password, result.rows[0].passwordhash);

    const session = await getSession(req, res);

    if (isMatch) {
      session.isAdmin = true;
      await session.save();
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
