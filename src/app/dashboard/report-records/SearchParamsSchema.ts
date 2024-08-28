import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { PaginationSchema } from '@/static';
import { addMonths } from 'date-fns';
import * as R from 'remeda';
import { z } from 'zod';

export const MAX_MONTHS = 3;

export function isValidInterval(startAt: Date, endAt: Date) {
  return startAt && endAt && startAt <= endAt && addMonths(startAt, MAX_MONTHS) >= endAt;
}

export const SearchParamsSchema = PaginationSchema.extend({
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  consignorID: z.coerce.number().optional(),
  type: z.coerce
    .number()
    .refine(R.isIncludedIn(RECORD_TYPE.data.map((item) => item.value)))
    .array()
    .default([]),
  status: z.coerce
    .number()
    .refine(R.isIncludedIn(RECORD_STATUS.data.map((item) => item.value)))
    .array()
    .default([]),
});
