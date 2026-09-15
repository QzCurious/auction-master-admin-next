import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  originalSorted: z.number(),
  newSorted: z.number(),
});

type Data = 'Success';

export async function AdminReorderItemPhoto(api: KyInstance, id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .patch<SuccessResponseJson<Data>>(`backend/items/${id}/photos`, {
      body: urlencoded,
    })
    .json();
  return res;
}
