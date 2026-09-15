import ky, { type Options } from 'ky';

export type ApiRequestOptions = Pick<Options, 'method' | 'body' | 'signal' | 'cache'> & { headers?: HeadersInit };
export type ApiTransport = ReturnType<typeof createApiTransport>;
export type ApiClient = Pick<ApiTransport, 'request'>;

/** Shared configuration only. Auth headers are supplied per request. */
export function createApiTransport(options: { baseUrl: string; fetch?: typeof fetch }) {
  const http = ky.create({
    prefixUrl: options.baseUrl,
    fetch: options.fetch,
    retry: 0,
    redirect: 'error',
  });

  return {
    async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
      return http(path, options).json<T>();
    },
  };
}
