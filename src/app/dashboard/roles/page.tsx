import type { Metadata } from 'next';
import Link from 'next/link';
import { roles } from '@/api/backend/rbac/roles';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';

import { RoleTable } from './RoleTable';

export const metadata = { title: `Roles | Dashboard | ${config.site.name}` } satisfies Metadata;

export default async function Page() {
  const res = await roles();

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Roles</Typography>
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
      <RoleTable rows={res.data.map((role) => ({ id: role.role, ...role })) ?? []} />
    </Stack>
  );
}
