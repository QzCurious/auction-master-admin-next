import { invalidSessionError } from '@/api/errors';
import { type Tokens } from '@/api/session';
import { CookieConfigs } from '@/domain/auth/CookieConfigs';

type CookieOptions = ReturnType<typeof CookieConfigs.token.opts> & { path?: string };
export interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}
export interface CookieWriter {
  set: (name: string, value: string, options: CookieOptions) => unknown;
}

export function readTokens(store: CookieReader): Tokens {
  const accessToken = store.get(CookieConfigs.token.name)?.value;
  const refreshToken = store.get(CookieConfigs.refreshToken.name)?.value;
  if (!accessToken || !refreshToken) throw invalidSessionError;
  return { accessToken, refreshToken };
}

export function writeTokens(store: CookieWriter, tokens: Tokens) {
  store.set(CookieConfigs.token.name, tokens.accessToken, { ...CookieConfigs.token.opts(), path: '/' });
  store.set(CookieConfigs.refreshToken.name, tokens.refreshToken, { ...CookieConfigs.refreshToken.opts(), path: '/' });
}

export function clearTokens(store: CookieWriter) {
  store.set(CookieConfigs.token.name, '', { ...CookieConfigs.token.opts(), path: '/', maxAge: 0 });
  store.set(CookieConfigs.refreshToken.name, '', { ...CookieConfigs.refreshToken.opts(), path: '/', maxAge: 0 });
}
