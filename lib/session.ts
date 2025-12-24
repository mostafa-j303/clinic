// lib/session.ts
import { getIronSession, SessionOptions, IronSession } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getIronSession<{ isAdmin?: boolean }>(req, res, sessionOptions);
}

export interface NextApiRequestWithSession extends NextApiRequest {
  session: IronSession<{ isAdmin?: boolean }>;
}


export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (!session || !session.isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }

  return session;
}