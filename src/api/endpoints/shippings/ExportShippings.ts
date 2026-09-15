import { type KyInstance } from 'ky';

export function ExportShippings(api: KyInstance, query: URLSearchParams) {
  return api.get(`backend/shippings/excel?${query}`);
}
