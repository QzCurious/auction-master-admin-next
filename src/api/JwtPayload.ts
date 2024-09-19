export interface JwtPayload {
  id: number;
  account: string;
  exp: number;
  iat: number;
  nbf: number;
}
