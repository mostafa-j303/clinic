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
  // Every route that reads/writes the admin session is inherently
  // session-dependent — its answer must never be cached or reused across
  // different logged-in/out states. Vercel/Next.js applies its default
  // cacheable-response headers to any GET route that doesn't explicitly opt
  // out, which silently broke logout in production (worked fine in local
  // dev, which has no CDN/edge cache layer to go stale against). Setting
  // this once here, centrally, covers every current and future caller
  // (getSession, requireAdmin, and everything built on top of them).
  res.setHeader("Cache-Control", "no-store, must-revalidate");
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