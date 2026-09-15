import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string().array(),
});

type Data = 'Success';

export async function AddRoleForAdmin(api: KyInstance, account: string, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/admins/account/${account}/roles`, {
      body: urlencoded,
    })
    .json();
  return res;
}
