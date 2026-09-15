import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z
  .object({
    password: z
      .string()
      .optional()
      .transform((val) => val || undefined),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

export async function UpdateAdmin(api: KyInstance, id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .patch<SuccessResponseJson<Data>>(`backend/admins/${id}`, {
      body: urlencoded,
    })
    .json();
  return res;
}
