import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { roles } from '@/api/backend/rbac/roles';
import { redirectIfAuthError } from '@/utils/auth';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';

import { RoleTable } from './RoleTable';

export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

export default async function Page() {
  const res = await roles();
  redirectIfAuthError(res.error);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Customers</Typography>
        </Stack>
        <div>
          <Button
            LinkComponent={Link}
            href="/dashboard/roles/create"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            Add
          </Button>
        </div>
      </Stack>
      <CustomersFilters />
      <RoleTable rows={res.data.map((role) => ({ id: role.role, ...role })) ?? []} />
    </Stack>
  );
}
