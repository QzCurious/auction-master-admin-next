import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';
import { type PermissionKey } from '@/domain/permission/types';

export interface Permission {
  key: PermissionKey;
  url: string;
  method: string;
  fields: Array<string>;
  description: string;
}

export interface PermissionGroup {
  message: string;
  permissions: Array<Permission>;
}

type Data = Array<PermissionGroup>;

export async function GetPermissions() {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>('backend/permissions', {})
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
