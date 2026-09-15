import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string().array(),
});

type Data = 'Success';

export async function DeleteRoleForAdmin(api: KyInstance, account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, payload);

  const res = await api
    .delete<SuccessResponseJson<Data>>(`backend/admins/account/${account}/roles?${query.toString()}`, {})
    .json();
  return res;
}
