import { PaginationSchema } from '@/domain/static/static';
import { WORKER_STATUS, WORKER_TYPE } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  type: z
    .string()
    .array()
    .transform(R.filter(R.isIncludedIn(WORKER_TYPE.data.map((item) => item.value))))
    .default([]),
  status: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(WORKER_STATUS.data.map((item) => item.value))))
    .default([]),
});
