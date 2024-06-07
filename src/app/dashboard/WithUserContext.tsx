import type React from 'react';
import { getToken } from '@/api/getToken';
import { type JwtPayload } from '@/api/JwtPayload';
import { jwtDecode } from 'jwt-decode';

import { UserContext } from '@/contexts/UserContext';

export default async function WithUserContext({ children }: { children: React.ReactNode }) {
  const { token } = await getToken();
  const jwt = token ? jwtDecode<JwtPayload>(token) : null;

  return (
    <UserContext
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
    </UserContext>
  );
}
