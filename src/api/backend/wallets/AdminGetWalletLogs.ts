'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type WALLET_ACTION } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

const ReqSchema = z.object({
  consignorId: z.coerce.number().optional(),
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
  consignorId: number;
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

  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/wallets/logs?${query}`, {
      next: { tags: ['wallets'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
