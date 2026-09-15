'use server';

import { revalidatePath } from 'next/cache';
import { createActionSession } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export default async function refreshTokenAction() {
  const result = await (async () => {
    const session = createActionSession();
    await session.refresh();
    await session.persistTokens();
    return { data: 'Success' as const, error: undefined };
  })().catch(createApiErrorServerSide);
  if (!result.error) revalidatePath('/', 'layout');
  return result;
}
