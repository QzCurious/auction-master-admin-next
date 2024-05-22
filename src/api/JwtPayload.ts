export interface JwtPayload {
  id: number;
  account: string;
  status: 11;
  exp: number;
  iat: number;
  nbf: number;
}
