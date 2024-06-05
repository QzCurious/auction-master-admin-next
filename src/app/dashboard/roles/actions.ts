'use server';

import { redirect } from 'next/navigation';
import { addPermissionsToRole } from '@/api/backend/rbac/addPermissionsToRole';
import { createRole } from '@/api/backend/rbac/createRole';
import { redirectAuthError } from '@/app/utils/redirectAuthError';

export async function createRoleAction(
  payload: Parameters<typeof createRole>[0] & Parameters<typeof addPermissionsToRole>[0]
) {
  {
    const res = await createRole(payload);
    redirectAuthError(res);
    res.error satisfies null;
  }
  {
    const res = await addPermissionsToRole(payload);
    redirectAuthError(res);
    res.error satisfies null;
  }

  redirect('/dashboard/roles');
}
