import { type Record } from '@/api/backend/reports/GetRecords';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

type Data = 'Success';

export async function RecordPaymentReview(api: KyInstance, id: Record['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/reports/records/${id}/review`, {
      body: urlencoded,
    })
    .json();
  return res;
}
