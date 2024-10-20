import { PaginationSchema, ROWS_PER_PAGE } from '@/domain/static/static';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  [ROWS_PER_PAGE]: z.coerce.number().min(1).default(30).catch(30),

  auctionId: z.string().array().optional().catch(undefined),
  consignorId: z.coerce.number().optional().catch(undefined),
});
