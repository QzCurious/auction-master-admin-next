import { type Shipping } from '@/api/backend/shippings/GetShippings';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z
  .object({
    shippingCostsWithinJapan: z.number(),
  })
  .partial();

type Data = 'Success';

export async function ShippingClosed(api: KyInstance, id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/shippings/${id}/closed`, {
      body: urlencoded,
    })
    .json();
  return res;
}
