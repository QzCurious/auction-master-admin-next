import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  permissions: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
});

type Data = 'Success';

export async function DeletePermissionForRole(api: KyInstance, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const permissions = data.permissions.flatMap((p) => p.fields.map((f) => `${p.key}:${f}`));

  const query = new URLSearchParams();
  appendEntries(query, { role: data.role, permissionKey: permissions });

  const res = await api.delete<SuccessResponseJson<Data>>(`/backend/permissions?${query.toString()}`).json();
  return res;
}
