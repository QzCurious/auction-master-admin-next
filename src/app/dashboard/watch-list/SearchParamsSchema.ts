import { PaginationSchema, ROWS_PER_PAGE } from '@/domain/static/static';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  [ROWS_PER_PAGE]: PaginationSchema.shape[ROWS_PER_PAGE].removeCatch().removeDefault().catch(50).default(50),

  auctionId: z.string().array().optional().catch(undefined),
  consignorId: z.coerce.number().optional().catch(undefined),
});
