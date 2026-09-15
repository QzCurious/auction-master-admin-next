import { type SuccessResponseJson } from '@/api/core/static';
import { type PermissionKey } from '@/domain/permission/types';
import { type KyInstance } from 'ky';

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

export async function GetPermissions(api: KyInstance) {
  const res = await api.get<SuccessResponseJson<Data>>('backend/permissions', {}).json();
  return res;
}
