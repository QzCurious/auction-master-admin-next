import { PaginationSchema } from '@/domain/static/static';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  consignorID: z.coerce.number().optional().catch(undefined),
});
