import { PaginationSchema } from '@/domain/static/static';
import { RECORD_STATUS, RECORD_TYPE } from '@/domain/static/static-config-mappers';
import { addDays, addMonths, startOfDay, subDays } from 'date-fns';
import * as R from 'remeda';
import { z } from 'zod';

export const MAX_MONTHS = 3;

export function validRange(startAt?: Date, endAt?: Date) {
  return Boolean(
    startAt && endAt && startAt <= endAt && endAt <= new Date() && addMonths(startAt, MAX_MONTHS) >= startOfDay(endAt)
  );
}

export function fixRange(startAt?: Date, endAt?: Date) {
  const defaultEndAt = startOfDay(addDays(new Date(), 1));
  const defaultStartAt = startOfDay(subDays(defaultEndAt, 7));
  return { startAt: startAt ?? defaultStartAt, endAt: endAt ?? defaultEndAt };
}

export const SearchParamsSchema = PaginationSchema.extend({
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  consignorId: z.coerce.number().optional(),
  type: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(RECORD_TYPE.data.map((item) => item.value))))
    .default([]),
  status: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(RECORD_STATUS.data.map((item) => item.value))))
    .default([]),
});
