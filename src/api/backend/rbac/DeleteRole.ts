'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

type Data = 'Success';

export async function DeleteRole(role: string) {
  const res = await apiClientWithToken
    .delete<SuccessResponseJson<Data>>(`backend/roles/${role}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('roles');

  return res;
}
