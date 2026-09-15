import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string().transform((r) => [r]),
  permissions: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
});

type Data = 'Success';

export async function AddPermissionForRole(api: KyInstance, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await api
    .post<SuccessResponseJson<Data>>('backend/permissions', {
      json: data,
    })
    .json();
  return res;
}
