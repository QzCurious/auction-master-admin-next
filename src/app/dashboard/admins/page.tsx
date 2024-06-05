import type { Metadata } from 'next';
import Link from 'next/link';
import { admins } from '@/api/backend/admins/admins';
import { configs } from '@/api/backend/configs';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';

import { RoleTable } from './AdminTable';
import { redirectAuthError } from '@/app/utils/redirectAuthError';

export const metadata = { title: `Roles | Dashboard | ${config.site.name}` } satisfies Metadata;

export default async function Page({
  searchParams: { rowsPerPage = '10', page = '0' },
}: {
  searchParams: { rowsPerPage?: string; page?: string };
}) {
  const limit = Number.isNaN(Number(rowsPerPage)) ? 10 : Number(rowsPerPage);
  const offset = Number.isNaN(Number(page)) ? 0 : Number(page) * limit;
  const [adminRes, configsRes] = await Promise.all([admins({ limit, offset }), configs()]);
  redirectAuthError(adminRes);
  redirectAuthError(configsRes);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Admins</Typography>
        </Stack>
        <div>
          <Button
            LinkComponent={Link}
            href="/dashboard/admins/create"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            Add
          </Button>
        </div>
      </Stack>
      <RoleTable rows={adminRes.data.admins} count={adminRes.data.count} adminStatus={configsRes.data.adminStatus} />
    </Stack>
  );
}
