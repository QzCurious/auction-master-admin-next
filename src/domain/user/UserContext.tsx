'use client';

import type React from 'react';
import { createContext } from 'react';
import type { JwtPayload } from '@/api/JwtPayload';

export const UserContext = createContext<User | null>(null);
export interface User extends Pick<JwtPayload, 'id' | 'account'> {}

export function UserContextProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
