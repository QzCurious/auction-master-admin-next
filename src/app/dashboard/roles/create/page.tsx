import { permissions } from '@/api/backend/rbac/permissions';
import { redirectIfAuthError } from '@/utils/auth';

import RoleForm from '../RoleForm';

async function Page() {
  const res = await permissions();
  redirectIfAuthError(res.error);

  return <RoleForm permissions={res.data} />;
}

export default Page;
