import type React from 'react';
import { type Metadata } from 'next';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';

import BalanceTabs from './BalanceTabs';

export const metadata = { title: `帳戶紀錄 | ${config.site.name}` } satisfies Metadata;

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            帳戶紀錄
          </Typography>
        </Stack>
      </Stack>

      <BalanceTabs />

      {children}
    </Stack>
  );
}
