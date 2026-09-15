import { jwtDecode } from 'jwt-decode';
import { HTTPError } from 'ky';

import { type FailedResponseJson } from './core/static';
import { invalidSessionError } from './errors';
import { type ApiClient, type ApiRequestOptions, type ApiTransport } from './transport';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export interface SessionOptions {
  transport: ApiTransport;
  readTokens: () => Tokens | Promise<Tokens>;
  refreshTokens: (tokens: Tokens) => Promise<Tokens>;
  persistTokens: (tokens: Tokens) => void | Promise<void>;
  now?: () => number;
}

/** Create once per operation group, never at module scope. */
export function createApiSession(options: SessionOptions) {
  let current: Promise<Tokens> | undefined;
  let refreshing: Promise<string> | undefined;
  let refreshFailure: unknown;
  let revision = 0;
  let persistedRevision = 0;
  let persisting: Promise<void> | undefined;

  async function readTokens() {
    current ??= Promise.resolve().then(options.readTokens);
    const tokens = await current;
    if (!tokens.accessToken || !tokens.refreshToken) throw invalidSessionError;
    return tokens;
  }

  async function refresh() {
    if (refreshFailure) throw refreshFailure;
    refreshing ??= (async () => {
      const tokens = await options.refreshTokens(await readTokens());
      if (!tokens.accessToken || !tokens.refreshToken) throw new Error('Invalid refresh response');
      current = Promise.resolve(tokens);
      revision += 1;
      return tokens.accessToken;
    })()
      .catch((error: unknown) => {
        // A failed refresh is not repeatedly attempted by sibling requests.
        refreshFailure = error;
        throw error;
      })
      .finally(() => {
        refreshing = undefined;
      });
    return refreshing;
  }

  async function persistTokens(): Promise<void> {
    if (persisting) {
      await persisting;
      return persistTokens();
    }
    if (persistedRevision === revision) return;
    const writingRevision = revision;
    persisting = (async () => {
      await options.persistTokens(await readTokens());
      persistedRevision = writingRevision;
    })().finally(() => {
      persisting = undefined;
    });
    await persisting;
    if (persistedRevision !== revision) await persistTokens();
  }

  const session = {
    readTokens,
    refresh,
    persistTokens,
    now: options.now ?? Date.now,
  };

  const api: ApiClient = {
    async request<T>(path: string, requestOptions: ApiRequestOptions = {}) {
      const token = await ensureFreshToken(session);
      const send = (accessToken: string) => {
        const headers = new Headers(requestOptions.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        return options.transport.request<T>(path, { ...requestOptions, headers });
      };
      try {
        return await send(token);
      } catch (error) {
        const method = (requestOptions.method ?? 'GET').toUpperCase();
        // Backend mutation rejection ordering is not established: never replay writes.
        if (!(error instanceof HTTPError) || error.response.status !== 401 || method !== 'GET') throw error;
        const body = (await error.response
          .clone()
          .json()
          .catch(() => null)) as FailedResponseJson | null;
        if (body?.status?.code !== '1003') throw error;
        return send(await refreshRejectedToken(session, token));
      }
    },
  };

  return { ...session, api };
}

export type ApiSession = ReturnType<typeof createApiSession>;
type AuthState = Pick<ApiSession, 'readTokens' | 'refresh' | 'now'>;

export async function ensureFreshToken(session: AuthState): Promise<string> {
  const { accessToken } = await session.readTokens();
  let exp: number | undefined;
  try {
    exp = jwtDecode<{ exp?: number }>(accessToken).exp;
  } catch {
    throw invalidSessionError;
  }
  if (typeof exp !== 'number' || !Number.isFinite(exp)) throw invalidSessionError;
  // This is an expiry hint, not signature verification; the backend authorizes requests.
  return exp * 1000 <= session.now() + 30_000 ? session.refresh() : accessToken;
}

export async function refreshRejectedToken(session: AuthState, rejectedToken: string): Promise<string> {
  const { accessToken } = await session.readTokens();
  return accessToken !== rejectedToken ? accessToken : session.refresh();
}
