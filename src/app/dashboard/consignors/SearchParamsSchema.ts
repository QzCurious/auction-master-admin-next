import { PaginationSchema } from '@/static';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  consignorID: z.coerce.number().optional().catch(undefined),
});
