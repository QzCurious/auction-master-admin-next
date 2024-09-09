import { ITEM_STATUS } from '@/api/backend/static-configs.data';
import { PaginationSchema } from '@/static';
import * as R from 'remeda';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  picking: z.enum(['return']).optional().catch(undefined),
  stage: z.enum(['picking', 'checking']).optional().catch(undefined),
  consignorID: z.coerce.number().optional().catch(undefined),
  status: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(ITEM_STATUS.data.map((item) => item.value))))
    .default([]),
});
