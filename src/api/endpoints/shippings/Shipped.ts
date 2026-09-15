import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { type Shipping } from '@/api/endpoints/shippings/GetShippings';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  shipmentTrackingNumber: z.string(),
  internationalShippingCosts: z.number().optional(),
});

type Data = 'Success';

export async function Shipped(api: KyInstance, id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/shippings/${id}/shipped`, {
      body: urlencoded,
    })
    .json();
  return res;
}
