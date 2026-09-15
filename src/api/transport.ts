import ky, { type Options } from 'ky';

import { ApiFailure, decodeFailure } from './errors';

export type ApiRequestOptions = Pick<Options, 'method' | 'body' | 'signal' | 'cache'> & { headers?: HeadersInit };
export type ApiTransport = ReturnType<typeof createApiTransport>;
export type ApiClient = Pick<ApiTransport, 'request'>;

/** Shared configuration only. Auth headers are supplied per request. */
export function createApiTransport(options: { baseUrl: string; fetch?: typeof fetch }) {
  const http = ky.create({
    prefixUrl: options.baseUrl,
    fetch: options.fetch,
    retry: 0,
    throwHttpErrors: false,
    redirect: 'error',
  });

  return {
    async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
      try {
        const response = await http(path, options);
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) throw decodeFailure(response.status, body);
        if (body === null) throw new ApiFailure('service', '9999', response.status);
        return body as T;
      } catch (error) {
        if (error instanceof ApiFailure) throw error;
        throw new ApiFailure('service');
      }
    },
  };
}
