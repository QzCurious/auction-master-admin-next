import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

type Data = 'Success';

type ErrorCode =
  // item type not set
  '1023';

export async function ItemAppraisalReview(api: KyInstance, id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/items/${id}/review`, {
      body: urlencoded,
    })
    .json();
  return res;
}
