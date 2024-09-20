import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const CookieConfigs = {
  token: {
    name: 'admin-token',
    opts: () => ({
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    }),
  },
  refreshToken: {
    name: 'admin-refresh-token',
    opts: () => ({
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    }),
  },
} satisfies Record<string, { name: string; opts: () => Partial<ResponseCookie> }>;
