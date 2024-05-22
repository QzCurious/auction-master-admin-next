'use server';

import { redirect } from 'next/navigation';
import { addPermissionsToRole } from '@/api/backend/rbac/addPermissionsToRole';
import { createRole } from '@/api/backend/rbac/createRole';
import { redirectIfAuthError } from '@/utils/auth';

export async function createRoleAction(
  payload: Parameters<typeof createRole>[0] & Parameters<typeof addPermissionsToRole>[0]
) {
  {
    const res = await createRole(payload);
    redirectIfAuthError(res.error);
    res.error satisfies null;
  }
  {
    const res = await addPermissionsToRole(payload);
    redirectIfAuthError(res.error);
    res.error satisfies null;
  }

  redirect('/dashboard/roles');
}
