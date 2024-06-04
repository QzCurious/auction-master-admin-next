import { type Permission } from './permissions.data';

export interface JwtPayload {
  id: number;
  account: string;
  role: Array<string>;
  permissions: Array<Permission>;
  exp: number;
  iat: number;
  nbf: number;
}
