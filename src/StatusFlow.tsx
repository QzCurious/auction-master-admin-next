import type React from 'react';

import { ITEM_STATUS_DATA, ITEM_STATUS_KEY_MAP, ITEM_STATUS_MAP, ITEM_TYPE_MAP } from './api/backend/configs.data';

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & unknown;

type Adjudicator = 'admin' | 'consignor';

type Step = {
  type?: Array<keyof typeof ITEM_TYPE_MAP>;
  status: keyof typeof ITEM_STATUS_MAP;
} & (
  | {
      next: [];
      adjudicator?: never;
    }
  | {
      next: [keyof typeof ITEM_STATUS_MAP, ...Array<keyof typeof ITEM_STATUS_MAP>];
      adjudicator: Adjudicator;
    }
);

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StatusFlow {
  // 要從 flowchart 的 root 依序排到 leaf; happy path 要排在 next 的最前面
  static flow = {
    SubmitAppraisalStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'SubmitAppraisalStatus',
      next: ['AppraisedStatus', 'AppraisalFailureStatus'],
      adjudicator: 'admin',
    },

    AppraisalFailureStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'AppraisalFailureStatus',
      next: [],
    },

    AppraisedStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'AppraisedStatus',
      next: ['ConsignmentApprovedStatus', 'ConsignorChoosesCompanyDirectPurchaseStatus', 'ConsignmentCanceledStatus'],
      adjudicator: 'consignor',
    },

    ConsignmentApprovedStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'ConsignmentApprovedStatus',
      next: ['ConsignorShippedItem'],
      adjudicator: 'consignor',
    },

    ConsignmentCanceledStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ConsignmentCanceledStatus',
      next: [],
    },

    ConsignorChoosesCompanyDirectPurchaseStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ConsignorChoosesCompanyDirectPurchaseStatus',
      next: ['ConsignorShippedItem'],
      adjudicator: 'admin',
    },

    ConsignorShippedItem: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ConsignorShippedItem',
      next: ['WarehouseArrivalStatus'],
      adjudicator: 'admin',
    },

    WarehouseArrivalStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehouseArrivalStatus',
      next: ['WarehousePersonnelConfirmedStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'admin',
    },

    WarehouseReturnPendingStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehouseReturnPendingStatus',
      next: ['WarehouseReturningStatus'],
      adjudicator: 'admin',
    },

    WarehouseReturningStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehouseReturningStatus',
      next: ['ReturnedStatus'],
      adjudicator: 'admin',
    },

    WarehousePersonnelConfirmedStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehousePersonnelConfirmedStatus',
      next: ['AppraiserConfirmedStatus', 'CompanyDirectPurchaseStatus'],
      adjudicator: 'admin',
    },

    AppraiserConfirmedStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'AppraiserConfirmedStatus',
      next: ['ConsignorConfirmedStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'consignor',
    },

    ConsignorConfirmedStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'ConsignorConfirmedStatus',
      next: ['BiddingStatus', 'CompanyReclaimedStatus'],
      adjudicator: 'admin',
    },

    BiddingStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'BiddingStatus',
      next: ['SoldStatus', 'CompanyRepurchasedStatus', 'ConsignorConfirmedStatus'],
      adjudicator: 'admin',
    },

    SoldStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'SoldStatus',
      next: [],
    },

    CompanyDirectPurchaseStatus: {
      type: ['CompanyDirectPurchaseType'],
      status: 'CompanyDirectPurchaseStatus',
      next: [],
    },

    ReturnedStatus: {
      type: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ReturnedStatus',
      next: [],
    },

    CompanyRepurchasedStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'CompanyRepurchasedStatus',
      next: [],
    },

    CompanyReclaimedStatus: {
      type: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'CompanyReclaimedStatus',
      next: [],
    },
  } satisfies Record<keyof typeof ITEM_STATUS_MAP, Step>;

  static withActions<T extends Adjudicator>(
    adjudicator: T,
    actions: {
      [k in keyof typeof StatusFlow.flow as (typeof StatusFlow.flow)[k] extends {
        adjudicator: T;
      }
        ? k
        : never]: React.ReactNode;
    }
  ): {
    [k in keyof typeof StatusFlow.flow]: Simplify<
      (typeof StatusFlow.flow)[k] extends { adjudicator: T }
        ? Omit<(typeof StatusFlow.flow)[k], 'adjudicator'> & {
            actions: React.ReactNode;
          }
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

interface TreeNode<T> {
  value: T;
  next: T[];
}

export function dfs<T>(nodes: TreeNode<T>[], from: T, to: T): T[] | null {
  const startNode = nodes.find((node) => node.value === from);
  if (!startNode) return null;

  const visited = new Set<T>();
  const path: T[] = [];

  function dfsRecursive(node: TreeNode<T>): boolean {
    visited.add(node.value);
    path.push(node.value);

    if (node.value === to) {
      return true;
    }

    for (const nextValue of node.next) {
      if (!visited.has(nextValue)) {
        const nextNode = nodes.find((n) => n.value === nextValue);
        if (nextNode && dfsRecursive(nextNode)) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  }

  return dfsRecursive(startNode) ? path : null;
}

export function bfs<T>(
  nodes: TreeNode<T>[],
  from: T,
  to: T,
  additionalCondition?: (node: TreeNode<T>) => boolean
): T[] | null {
  const startNode = nodes.find((node) => node.value === from);
  if (!startNode) return null;

  const queue: [TreeNode<T>, T[]][] = [[startNode, []]];
  const visited = new Set<T>();

  while (queue.length > 0) {
    const [currentNode, path] = queue.shift()!;

    if (currentNode.value === to && additionalCondition?.(currentNode)) {
      return [...path, currentNode.value];
    }

    visited.add(currentNode.value);

    for (const nextValue of currentNode.next) {
      if (!visited.has(nextValue)) {
        const nextNode = nodes.find((n) => n.value === nextValue);
        if (nextNode) {
          queue.push([nextNode, [...path, currentNode.value]]);
        }
      }
    }
  }

  return null;
}

([1, 3, 13, 14, 21, 24, 32] as const).map((x) => ITEM_STATUS_DATA.find(({ value }) => value === x)?.message); // ?
['已提交估價', '已估價', '寄售人選擇公司直購', '已寄出', '已到貨', '倉管已確認', '公司直購'];
