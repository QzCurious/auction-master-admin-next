import { type Permission } from './backend/rbac/GetPermissions';

export interface JwtPayload {
  id: number;
  account: string;
  role: Array<string>;
  permissions: Array<Permission>;
  exp: number;
  iat: number;
  nbf: number;
}
