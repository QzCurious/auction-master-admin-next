import type React from 'react';

import { type ITEM_STATUS_MAP, type ITEM_TYPE_MAP } from './api/backend/configs.data';

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
      nexts: ['AppraiserConfirmedStatus'],
      adjudicator: 'admin',
    },
    AppraiserConfirmedStatus: {
      allowTypes: [
        'AppraisableAuctionItemType',
        'NonAppraisableAuctionItemType',
        'FixedPriceItemType',
        'CompanyDirectPurchaseType',
      ],
      status: 'AppraiserConfirmedStatus',
      nexts: ['ConsignorConfirmedStatus', 'CompanyDirectPurchaseStatus', 'WarehouseReturnPendingStatus'],
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

  static makeActionMap<T extends Adjudicator>(
    adjudicator: T,
    actionMap: {
      [k in keyof typeof this.flow as (typeof this.flow)[k] extends {
        adjudicator: T;
      }
        ? k
        : never]: React.ReactNode;
    }
  ) {
    return actionMap;
  }

  static flowPath(to: keyof typeof ITEM_STATUS_MAP, type: null | keyof typeof ITEM_TYPE_MAP) {
    const from = 'SubmitAppraisalStatus';
    const path = bfs(
      Object.values(this.flow).map((v) => ({
        value: v.status,
        nexts: v.nexts,
      })),
      from,
      to,
      (step) => type === null || this.flow[step.value].allowTypes.some((t) => t === type)
    ) ?? ['SubmitAppraisalStatus'];

    // fill reset path
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const last = path[path.length - 1];
      const step = this.flow[last];
      const happyNext = step.nexts.find((s) => type === null || this.flow[s].allowTypes.some((t) => t === type));
      if (!happyNext) break;
      path.push(happyNext);
    }

    return path;
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

    for (const next of currentNode.nexts) {
      if (visited.has(next)) continue;
      visited.add(next);

      const nextNode = nodes.find((n) => n.value === next);
      if (!nextNode) continue;

      if (additionalCondition && !additionalCondition(nextNode)) continue;

      queue.push([nextNode, [...path, currentNode.value]]);
    }
  }

  return null;
}
