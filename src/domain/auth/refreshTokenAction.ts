'use server';

import { revalidatePath } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { refreshRejectedToken } from '@/api/session';
import { withApiSession } from '@/server/next/withApiSession';

export default async function refreshTokenAction() {
  const result = await withApiSession(async (_api, session) => {
    const tokens = await session.readTokens();
    await refreshRejectedToken(session, tokens.accessToken);
    return { data: 'Success' as const, error: undefined };
  }).catch(createApiErrorServerSide);
  if (!result.error) revalidatePath('/', 'layout');
  return result;
}
