import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { WORKER_STATUS } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';
import * as R from 'remeda';
import { z } from 'zod';

const ReqSchema = z.object({
  status: z.coerce.number().refine(R.isIncludedIn(WORKER_STATUS.data.map((item) => item.value))),
});

type Data = 'Success';

export async function ToggleActivateWorker(api: KyInstance, id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await api.patch<SuccessResponseJson<Data>>(`backend/workers/${id}/${data.status}`).json();
  return res;
}
