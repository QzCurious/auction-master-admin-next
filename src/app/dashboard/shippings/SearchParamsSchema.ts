import { SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { PaginationSchema } from '@/domain/static/static';
import * as R from 'remeda';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  'pick-for-shipping': z.enum(['picking', 'checking']).optional().catch(undefined),
  status: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(SHIPPING_STATUS.data.map((item) => item.value))))
    .default([]),
});
