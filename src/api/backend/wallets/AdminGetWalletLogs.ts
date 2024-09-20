'use server';

import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type WALLET_ACTION } from '@/domain/static/static-config-mappers';

const ReqSchema = z.object({
  consignorID: z.coerce.number().optional(),
  action: z.coerce.number().array().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

export interface WalletLogs {
  id: number;
  consignorID: number;
  opCode: string;
  action: WALLET_ACTION['value'];
  previousBalance: number;
  netDifference: number;
  createdAt: string;
}

interface Data {
  walletLogs: Array<WalletLogs>;
  count: number;
}

type ErrorCode = never;

export async function AdminGetWalletLogs(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/wallets/logs?${query}`, {
    method: 'GET',
    next: { tags: ['wallets'] },
  });

  return res;
}
