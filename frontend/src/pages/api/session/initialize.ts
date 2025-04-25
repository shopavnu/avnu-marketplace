import type { NextApiRequest, NextApiResponse } from 'next';

type SessionResponse = {
  sessionId: string;
  created: string;
  expires: string;
  user: {
    isAuthenticated: boolean;
    isGuest: boolean;
    preferences: Record<string, any>;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Create a session response
  const sessionResponse: SessionResponse = {
    sessionId: `session-${Date.now()}`,
    created: new Date().toISOString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: {
      isAuthenticated: false,
      isGuest: true,
      preferences: {}
    }
  };

  res.status(200).json(sessionResponse);
}
