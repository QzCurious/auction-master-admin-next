'use server';

import { redirect } from 'next/navigation';
import { addPermissionsToRole } from '@/api/backend/rbac/addPermissionsToRole';
import { createRole } from '@/api/backend/rbac/createRole';

export async function createRoleAction(
  payload: Parameters<typeof createRole>[0] & Parameters<typeof addPermissionsToRole>[0]
) {
  {
    const res = await createRole(payload);
    res.error satisfies null;
  }
  {
    const res = await addPermissionsToRole(payload);
    res.error satisfies null;
  }

  redirect('/dashboard/roles');
}
