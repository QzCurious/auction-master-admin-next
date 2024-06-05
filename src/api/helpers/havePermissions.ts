import { jwtDecode } from 'jwt-decode';

import { type JwtPayload } from '../JwtPayload';
import { type Permission } from '../permissions.data';
import { getToken } from '../getToken';

export async function havePermissions(...permissions: Permission[]) {
  const permitted = await tryPermissions(permissions);

  // try again with token refreshed
  if (!permitted) {
    return tryPermissions(permissions, true);
  }

  return permitted;
}

async function tryPermissions(permissions: Permission[], force = false) {
  const { token } = await getToken({ force });
  if (!token) {
    return false;
  }

  const jwt = jwtDecode<JwtPayload>(token);
  if (!jwt) {
    return false;
  }

  const permitted = permissions.every((permission) => jwt.permissions.includes(permission));

  return permitted;
}
