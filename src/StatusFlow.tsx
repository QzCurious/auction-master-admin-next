import type React from 'react';

import { type ITEM_STATUS_MAP } from './api/backend/configs.data';

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & unknown;

type Adjudicator = 'admin' | 'consignor';

type Step =
  | {
      status: keyof typeof ITEM_STATUS_MAP;
      next?: never;
      adjudicator?: never;
    }
  | {
      status: keyof typeof ITEM_STATUS_MAP;
      next: [keyof typeof ITEM_STATUS_MAP, ...Array<keyof typeof ITEM_STATUS_MAP>];
      adjudicator: Adjudicator;
    };

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StatusFlow {
  // 要從 flowchart 的 root 依序排到 leaf; happy path 要排在 next 的最前面
  static flow = {
    SubmitAppraisalStatus: {
      status: 'SubmitAppraisalStatus',
      next: ['AppraisedStatus', 'AppraisalFailureStatus'],
      adjudicator: 'admin',
    },
    AppraisalFailureStatus: {
      status: 'AppraisalFailureStatus',
    },
    AppraisedStatus: {
      status: 'AppraisedStatus',
      next: ['ConsignmentApprovedStatus', 'ConsignmentCanceledStatus'],
      adjudicator: 'consignor',
    },
    ConsignmentCanceledStatus: {
      status: 'ConsignmentCanceledStatus',
    },
    ConsignmentApprovedStatus: {
      status: 'ConsignmentApprovedStatus',
      next: ['WarehouseArrivalStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'admin',
    },
    WarehouseReturnPendingStatus: {
      status: 'WarehouseReturnPendingStatus',
      next: ['WarehouseReturningStatus'],
      adjudicator: 'admin',
    },
    WarehouseReturningStatus: {
      status: 'WarehouseReturningStatus',
      next: ['ReturnedStatus'],
      adjudicator: 'admin',
    },
    ReturnedStatus: {
      status: 'ReturnedStatus',
    },
    WarehouseArrivalStatus: {
      status: 'WarehouseArrivalStatus',
      next: ['DetailsFullyCompletedStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'admin',
    },
    DetailsFullyCompletedStatus: {
      status: 'DetailsFullyCompletedStatus',
      next: ['ReadyStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'consignor',
    },
    ReadyStatus: {
      status: 'ReadyStatus',
      next: ['BiddingStatus', 'CompanyReclaimedStatus'],
      adjudicator: 'admin',
    },
    CompanyReclaimedStatus: {
      status: 'CompanyReclaimedStatus',
    },
    BiddingStatus: {
      status: 'BiddingStatus',
      next: ['SoldStatus', 'CompanyRepurchasedStatus', 'ReadyStatus'],
      adjudicator: 'admin',
    },
    CompanyRepurchasedStatus: {
      status: 'CompanyRepurchasedStatus',
    },
    SoldStatus: {
      status: 'SoldStatus',
    },
  } satisfies Record<keyof typeof ITEM_STATUS_MAP, Step>;

  static withActions<T extends Adjudicator>(
    adjudicator: T,
    actions: {
      [k in keyof typeof StatusFlow.flow as (typeof StatusFlow.flow)[k] extends { adjudicator: T }
        ? k
        : never]: React.ReactNode;
    }
  ): {
    [k in keyof typeof StatusFlow.flow]: Simplify<
      (typeof StatusFlow.flow)[k] extends { adjudicator: T }
        ? Omit<(typeof StatusFlow.flow)[k], 'adjudicator'> & { actions: React.ReactNode }
        : Omit<(typeof StatusFlow.flow)[k], 'adjudicator'>
    >;
  } {
    const newFlow = structuredClone(StatusFlow.flow);
    // const newFlow = (StatusFlow.flow);
    for (const [key, value] of Object.entries(actions)) {
      const step = newFlow[key as keyof typeof actions];
      if (step.adjudicator !== adjudicator) throw new Error('adjudicator mismatch');
      // @ts-expect-error transforming by js
      step.actions = value;
    }
    for (const step of Object.values(newFlow)) {
      // @ts-expect-error transforming by js
      if ('adjudicator' in step) delete step.adjudicator;
    }

    return newFlow as any;
  }
}

const s = StatusFlow.withActions('consignor', { AppraisedStatus: 'dd', DetailsFullyCompletedStatus: 'bb' });
s.SubmitAppraisalStatus;
s.AppraisedStatus;

const key: keyof typeof StatusFlow.flow = 'SubmitAppraisalStatus' as keyof typeof StatusFlow.flow;
const dd = s[key];
'next' in s[key] && s[key].next;
'next' in dd && dd.next;
