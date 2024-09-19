import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { z } from 'zod';

export const cookieConfigs = {
  token: {
    name: 'admin-token',
    opts: () => ({
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    }),
  },
  refreshToken: {
    name: 'admin-refresh-token',
    opts: () => ({
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    }),
  },
} satisfies Record<string, { name: string; opts: () => Partial<ResponseCookie> }>;

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const ROWS_PER_PAGE = 'rowsPerPage';
export const PAGE = 'page';
export const PaginationSchema = z.object({
  [ROWS_PER_PAGE]: z.coerce.number().min(1).default(10).catch(10),
  [PAGE]: z.coerce.number().min(0).default(0).catch(0),
});
export type PaginationSearchParams = z.output<typeof PaginationSchema>;
export const defaultPagination = PaginationSchema.parse({});

export const toPercent = (num: number) => {
  return num.toLocaleString('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

export type Currency = 'JPY' | 'TWD';
export function currencySign(currency: Currency) {
  switch (currency) {
    case 'JPY':
      return '¥';
    case 'TWD':
      return 'NT$';
  }
}

// form, search params | domain related -------------
type Value = string | number | boolean | Date;

export function appendEntries(x: URLSearchParams | FormData, obj: Record<string, null | undefined | Value | Value[]>) {
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      for (const each of v) {
        x.append(k, convertToString(each));
      }
    } else if (v === null) {
      continue;
    } else if (v === undefined) {
      continue;
    } else if (typeof v === 'number' && isNaN(v)) {
      continue;
    } else {
      x.append(k, convertToString(v));
    }
  }
  return x;
}

function convertToString(v: Value): string {
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return v.toString();
  if (v instanceof Date) return v.toISOString();

  v satisfies never;
  return v;
}
// ------------------------------------
