import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { z } from 'zod';

export const cookieConfigs = {
  token: {
    name: 'admin-token',
    opts: {
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    },
  },
  refreshToken: {
    name: 'admin-refresh-token',
    opts: {
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    },
  },
} satisfies Record<string, { name: string; opts: Partial<ResponseCookie> }>;

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const ROWS_PER_PAGE = 'rowsPerPage';
export const PAGE = 'page';
export const PaginationSchema = z.object({
  [ROWS_PER_PAGE]: z.coerce.number().min(1).default(10).catch(10),
  [PAGE]: z.coerce.number().min(0).default(0).catch(0),
});
export interface PaginationSearchParams {
  [ROWS_PER_PAGE]: string;
  [PAGE]: string;
}
export const defaultPagination = PaginationSchema.parse({});

export const toPercent = (num: number) => {
  return num.toLocaleString('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};
