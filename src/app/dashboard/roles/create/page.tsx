import { permissions } from '@/api/backend/rbac/permissions';

import Form from '../RoleForm';
import { redirectIfAuthError } from '@/utils/auth';

async function Page() {
  const res = await permissions();
  redirectIfAuthError(res.error);

  return (
    <main>
      <Form permissions={res.data} />
    </main>
  );
}

export default Page;
