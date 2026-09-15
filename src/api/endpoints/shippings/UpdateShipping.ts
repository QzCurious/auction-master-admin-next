import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { type Shipping } from '@/api/endpoints/shippings/GetShippings';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z
  .object({
    actionType: z.number(),
    shipmentType: z.number(),
    itemIds: z.array(z.number()),
    auctionIds: z.array(z.string()),
    address: z.string().min(1),
    storeNumber: z.string().min(1),
    storeName: z.string().min(1),
    recipientName: z.string().min(1),
    phone: z.string().min(1),
    shipmentTrackingNumber: z.string().min(1),
    internationalShippingCosts: z.number(),
    remark: z.string(),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

export async function UpdateShipping(api: KyInstance, id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .patch<SuccessResponseJson<Data>>(`backend/shippings/${id}`, {
      body: urlencoded,
    })
    .json();
  return res;
}
