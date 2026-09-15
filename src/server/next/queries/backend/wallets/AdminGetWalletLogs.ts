import 'server-only';

import * as endpoint from '@/api/backend/wallets/AdminGetWalletLogs';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function AdminGetWalletLogs(payload: Parameters<typeof endpoint.AdminGetWalletLogs>[1]) {
  const res = await endpoint
    .AdminGetWalletLogs(createRenderApi().extend({ next: { tags: ['wallets'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
