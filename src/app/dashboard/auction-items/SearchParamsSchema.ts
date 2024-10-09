import { PaginationSchema } from '@/domain/static/static';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  picking: z.enum(['shipping', 'fee']).optional().catch(undefined),
  stage: z.enum(['picking', 'checking']).optional().catch(undefined),
  auctionId: z.string().array().optional().catch(undefined),
  consignorId: z.coerce.number().optional().catch(undefined),
  status: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(AUCTION_ITEM_STATUS.data.map((item) => item.value))))
    .default([]),
});
