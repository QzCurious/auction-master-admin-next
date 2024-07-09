import type React from 'react';

import { type ITEM_STATUS_MAP } from './api/backend/configs.data';

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & unknown;

type Adjudicator = 'admin' | 'consignor';

type Step =
  | {
      status: keyof typeof ITEM_STATUS_MAP;
      next: [];
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
      next: [],
    },
    AppraisedStatus: {
      status: 'AppraisedStatus',
      next: ['ConsignmentApprovedStatus', 'ConsignmentCanceledStatus'],
      adjudicator: 'consignor',
    },
    ConsignmentCanceledStatus: {
      status: 'ConsignmentCanceledStatus',
      next: [],
    },
    ConsignmentApprovedStatus: {
      status: 'ConsignmentApprovedStatus',
      next: ['ConsignorShippedItem'],
      adjudicator: 'consignor',
    },
    ConsignorShippedItem: {
      status: 'ConsignorShippedItem',
      next: ['WarehouseArrivalStatus'],
      adjudicator: 'admin',
    },
    WarehouseArrivalStatus: {
      status: 'WarehouseArrivalStatus',
      next: ['CustomerServiceConfirmedStatus', 'WarehouseReturnPendingStatus'],
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
      next: [],
    },
    CustomerServiceConfirmedStatus: {
      status: 'CustomerServiceConfirmedStatus',
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
      next: [],
    },
    BiddingStatus: {
      status: 'BiddingStatus',
      next: ['SoldStatus', 'ReadyStatus', 'CompanyRepurchasedStatus'],
      adjudicator: 'admin',
    },
    CompanyRepurchasedStatus: {
      status: 'CompanyRepurchasedStatus',
      next: [],
    },
    SoldStatus: {
      status: 'SoldStatus',
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

const s = StatusFlow.withActions('consignor', {
  AppraisedStatus: 'dd',
  CustomerServiceConfirmedStatus: 'bb',
  ConsignmentApprovedStatus: 'cc',
});
s.SubmitAppraisalStatus;
s.AppraisedStatus;
s.CompanyRepurchasedStatus;

const key: keyof typeof StatusFlow.flow = 'SubmitAppraisalStatus' as keyof typeof StatusFlow.flow;
const dd = s[key];
'next' in s[key] && s[key].next;
'next' in dd && dd.next;

const bbb = dfs(
  Object.values(StatusFlow.flow).map((v) => ({ value: v.status, next: v.next })),
  'SubmitAppraisalStatus',
  'ReturnedStatus'
); //?
const aaa = bfs(
  Object.values(StatusFlow.flow).map((v) => ({ value: v.status, next: v.next })),
  'SubmitAppraisalStatus',
  'ReturnedStatus'
); //?

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

export function bfs<T>(nodes: TreeNode<T>[], from: T, to: T): T[] | null {
  const startNode = nodes.find((node) => node.value === from);
  if (!startNode) return null;

  const queue: [TreeNode<T>, T[]][] = [[startNode, []]];
  const visited = new Set<T>();

  while (queue.length > 0) {
    const [currentNode, path] = queue.shift()!;

    if (currentNode.value === to) {
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
