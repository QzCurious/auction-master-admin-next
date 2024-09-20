'use client';

import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';

import { FlowGraph } from '@/components/FlowGraph';

export default function Page() {
  const flow = {
    InitStatus: {
      status: 'InitStatus',
      nexts: [
        'StopBiddingStatus',
        'HighestBiddedStatus',
        'NotHighestBiddedStatus',
        'ClosedStatus',
        'ConsignorRequestCancellationStatus',
        'AwaitingConsignorPayFeeStatus',
      ],
      adjudicator: 'system',
    },
    StopBiddingStatus: {
      status: 'StopBiddingStatus',
      nexts: ['InitStatus', 'ClosedStatus', 'ConsignorRequestCancellationStatus', 'AwaitingConsignorPayFeeStatus'],
      adjudicator: 'admin',
    },
    HighestBiddedStatus: {
      status: 'HighestBiddedStatus',
      nexts: [
        'NotHighestBiddedStatus',
        'ClosedStatus',
        'ConsignorRequestCancellationStatus',
        'AwaitingConsignorPayFeeStatus',
      ],
      adjudicator: 'system',
    },
    NotHighestBiddedStatus: {
      status: 'NotHighestBiddedStatus',
      nexts: [
        'HighestBiddedStatus',
        'ClosedStatus',
        'ConsignorRequestCancellationStatus',
        'AwaitingConsignorPayFeeStatus',
      ],
      adjudicator: 'system',
    },
    ClosedStatus: {
      status: 'ClosedStatus',
      nexts: ['SoldStatus'],
      adjudicator: 'admin',
    },
    ConsignorRequestCancellationStatus: {
      status: 'ConsignorRequestCancellationStatus',
      nexts: ['CanceledStatus'],
      adjudicator: 'consignor',
    },
    AwaitingConsignorPayFeeStatus: {
      status: 'AwaitingConsignorPayFeeStatus',
      nexts: ['ConsignorFeePaidStatus'],
      adjudicator: 'consignor',
    },
    SoldStatus: {
      status: 'SoldStatus',
      nexts: [],
    },
    CanceledStatus: {
      status: 'CanceledStatus',
      nexts: [],
    },
    ConsignorFeePaidStatus: {
      status: 'ConsignorFeePaidStatus',
      nexts: [],
    },
  } as const;

  for (const step of Object.values(flow)) {
    (step as unknown as { id: string }).id = step.status;
  }

  return (
    <FlowGraph
      flow={flow as any}
      startId={'InitStatus' as AUCTION_ITEM_STATUS['key']}
      getMessage={(status) => AUCTION_ITEM_STATUS.get('key', status as AUCTION_ITEM_STATUS['key']).message}
      getValue={(status) => AUCTION_ITEM_STATUS.enum(status as any) as any}
    />
  );
}
