import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/wallets/AdminGetWalletLogs';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { WalletLogs } from '@/api/endpoints/wallets/AdminGetWalletLogs';
export async function AdminGetWalletLogs(payload: Parameters<typeof endpoint.AdminGetWalletLogs>[1]) {
  const res = await endpoint
    .AdminGetWalletLogs(createRenderApi().extend({ next: { tags: ['wallets'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
