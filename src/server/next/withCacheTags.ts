import { type ApiClient, type ApiRequestOptions } from '@/api/transport';

/** Keep Next.js caching metadata in the framework adapter. Ky forwards fetch options. */
export function withCacheTags(api: ApiClient, tags: string[]): ApiClient {
  return {
    request<T>(path: string, options: ApiRequestOptions = {}) {
      const nextOptions = { ...options, next: { tags } };
      return api.request<T>(path, nextOptions);
    },
  };
}
