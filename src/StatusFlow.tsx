import type React from 'react';

import { type ITEM_STATUS_MAP, type ITEM_TYPE_MAP } from './api/backend/configs.data';

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & unknown;

type Adjudicator = 'admin' | 'consignor';

type Step = {
  allowTypes?: Array<keyof typeof ITEM_TYPE_MAP>;
  status: keyof typeof ITEM_STATUS_MAP;
} & (
  | {
      nexts: [];
      adjudicator?: never;
    }
  | {
      nexts: [keyof typeof ITEM_STATUS_MAP, ...Array<keyof typeof ITEM_STATUS_MAP>];
      adjudicator: Adjudicator;
    }
);

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StatusFlow {
  // 要從 flowchart 的 root 依序排到 leaf; happy path 要排在 next 的最前面
  // https://github.com/win30221/auction-master/blob/v2/service/usecase/status_tree.go#L61-L286
  static flow = {
    SubmitAppraisalStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'SubmitAppraisalStatus',
      nexts: ['AppraisedStatus', 'AppraisalFailureStatus'],
      adjudicator: 'admin',
    },
    AppraisalFailureStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'AppraisalFailureStatus',
      nexts: [],
    },
    AppraisedStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'AppraisedStatus',
      nexts: ['ConsignmentApprovedStatus', 'ConsignorChoosesCompanyDirectPurchaseStatus', 'ConsignmentCanceledStatus'],
      adjudicator: 'consignor',
    },
    ConsignmentApprovedStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'ConsignmentApprovedStatus',
      nexts: ['ConsignorShippedItem'],
      adjudicator: 'consignor',
    },
    ConsignmentCanceledStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ConsignmentCanceledStatus',
      nexts: [],
    },
    ConsignorChoosesCompanyDirectPurchaseStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ConsignorChoosesCompanyDirectPurchaseStatus',
      nexts: ['ConsignorShippedItem'],
      adjudicator: 'admin',
    },
    ConsignorShippedItem: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ConsignorShippedItem',
      nexts: ['WarehouseArrivalStatus'],
      adjudicator: 'admin',
    },
    WarehouseArrivalStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehouseArrivalStatus',
      nexts: ['WarehousePersonnelConfirmedStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'admin',
    },
    WarehouseReturnPendingStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehouseReturnPendingStatus',
      nexts: ['WarehouseReturningStatus'],
      adjudicator: 'admin',
    },
    WarehouseReturningStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehouseReturningStatus',
      nexts: ['ReturnedStatus'],
      adjudicator: 'admin',
    },
    WarehousePersonnelConfirmedStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'WarehousePersonnelConfirmedStatus',
      nexts: ['AppraiserConfirmedStatus', 'CompanyDirectPurchaseStatus'],
      adjudicator: 'admin',
    },
    AppraiserConfirmedStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'AppraiserConfirmedStatus',
      nexts: ['ConsignorConfirmedStatus', 'WarehouseReturnPendingStatus'],
      adjudicator: 'consignor',
    },
    ConsignorConfirmedStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'ConsignorConfirmedStatus',
      nexts: ['BiddingStatus', 'CompanyReclaimedStatus'],
      adjudicator: 'admin',
    },
    BiddingStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'BiddingStatus',
      nexts: ['SoldStatus', 'CompanyRepurchasedStatus', 'ConsignorConfirmedStatus'],
      adjudicator: 'admin',
    },
    SoldStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'SoldStatus',
      nexts: [],
    },
    CompanyDirectPurchaseStatus: {
      allowTypes: ['CompanyDirectPurchaseType'],
      status: 'CompanyDirectPurchaseStatus',
      nexts: [],
    },
    ReturnedStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'ReturnedStatus',
      nexts: [],
    },
    CompanyRepurchasedStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'CompanyRepurchasedStatus',
      nexts: [],
    },
    CompanyReclaimedStatus: {
      allowTypes: ['AppraisableAuctionItemType', 'NonAppraisableAuctionItemType', 'FixedPriceItemType'],
      status: 'CompanyReclaimedStatus',
      nexts: [],
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
  nexts: T[];
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

    for (const nextValue of node.nexts) {
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

    for (const nextValue of currentNode.nexts) {
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
