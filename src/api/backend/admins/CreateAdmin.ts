import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  account: z.string(),
  password: z.string(),
  status: z.number(),
});

type Data = 'Success';

export async function CreateAdmin(api: KyInstance, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, payload);

  const res = await api
    .post<SuccessResponseJson<Data>>('backend/admins', {
      body: urlencoded,
    })
    .json();
  return res;
}
