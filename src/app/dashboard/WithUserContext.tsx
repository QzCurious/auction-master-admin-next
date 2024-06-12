import type React from 'react';
import { getToken } from '@/api/getToken';
import { type JwtPayload } from '@/api/JwtPayload';
import { jwtDecode } from 'jwt-decode';

import { UserContextProvider } from '@/contexts/UserContext';

export default async function WithUserContext({ children }: { children: React.ReactNode }) {
  const { token } = await getToken();
  const jwt = token ? jwtDecode<JwtPayload>(token) : null;

  return (
    <UserContextProvider
      user={
        jwt
          ? {
              id: jwt.id,
              account: jwt.account,
              permissions: jwt.permissions,
            }
          : null
      }
    >
      {children}
    </UserContextProvider>
  );
}
