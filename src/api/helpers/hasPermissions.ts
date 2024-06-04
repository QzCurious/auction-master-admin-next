import { jwtDecode } from 'jwt-decode';

import { type JwtPayload } from '../JwtPayload';
import { type Permission } from '../permissions.data';
import { tryRefreshToken } from '../withAuth';

export async function hasPermissions(...permissions: Permission[]) {
  const { token } = await tryRefreshToken();
  if (!token) {
    return false;
  }

  const jwt = jwtDecode<JwtPayload>(token);
  if (!jwt) {
    return false;
  }

  return jwt.permissions.some((p) => permissions.includes(p));
}
