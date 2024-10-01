import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const CookieConfigs = {
  token: {
    name: 'admin-token',
    opts: () => ({
      maxAge: 14 * 24 * 60 * 60, // 14 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.HOST_BASE_URL?.startsWith('https'),
    }),
  },
  refreshToken: {
    name: 'admin-refresh-token',
    opts: () => ({
      maxAge: 14 * 24 * 60 * 60, // 14 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.HOST_BASE_URL?.startsWith('https'),
    }),
  },
} satisfies Record<string, { name: string; opts: () => Partial<ResponseCookie> }>;
