import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

export interface Role {
  role: string;
  description: string;
}

type Data = Array<Role>;

export async function GetRoles() {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>('backend/roles', {
      next: {
        tags: ['roles'],
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
