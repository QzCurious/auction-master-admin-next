import { type PermissionKey } from './backend/rbac/permissions.data';

export interface JwtPayload {
  id: number;
  account: string;
  role: Array<string>;
  permissions: Array<PermissionKey>;
  exp: number;
  iat: number;
  nbf: number;
}
