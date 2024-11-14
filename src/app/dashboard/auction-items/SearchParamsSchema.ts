import { PaginationSchema, ROWS_PER_PAGE } from '@/domain/static/static';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

export const SearchParamsSchema = PaginationSchema.extend({
  [ROWS_PER_PAGE]: PaginationSchema.shape[ROWS_PER_PAGE].removeCatch().removeDefault().catch(50).default(50),
  picking: z.enum(['shipping', 'fee']).optional().catch(undefined),
  stage: z.enum(['picking', 'checking']).optional().catch(undefined),
  auctionId: z.string().array().optional().catch(undefined),
  consignorId: z.coerce.number().optional().catch(undefined),
  status: z.coerce
    .number()
    .array()
    .transform(R.filter(R.isIncludedIn(AUCTION_ITEM_STATUS.data.map((item) => item.value))))
    .default([
      AUCTION_ITEM_STATUS.enum('InitStatus'),
      AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
      AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
      AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
      AUCTION_ITEM_STATUS.enum('ClosedStatus'),
      AUCTION_ITEM_STATUS.enum('AwaitingConsignorPayFeeStatus'),
      AUCTION_ITEM_STATUS.enum('ConsignorRequestCancellationStatus'),
    ]),
});
