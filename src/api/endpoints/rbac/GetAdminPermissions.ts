import { type SuccessResponseJson } from '@/api/core/static';
import { type Admin } from '@/api/endpoints/admins/GetAdmins';
import { type Permissions } from '@/domain/permission/evaluatePermissions';
import { type KyInstance } from 'ky';

export type { Permissions } from '@/domain/permission/evaluatePermissions';

type Data = Permissions;

export async function GetAdminPermissions(api: KyInstance, account: Admin['account']) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/permissions/${account}`, {}).json();
  return res;
}
