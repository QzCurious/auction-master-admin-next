'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';

export default function BalanceTabs() {
  const pathname = usePathname();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={pathname === '/dashboard/consignor-balance/wallet-logs' ? '錢包紀錄' : '紅利紀錄'}>
        <Tab label="錢包紀錄" value="錢包紀錄" LinkComponent={Link} href="/dashboard/consignor-balance/wallet-logs" />
        <Tab label="紅利紀錄" value="紅利紀錄" LinkComponent={Link} href="/dashboard/consignor-balance/bonus-logs" />
      </Tabs>
    </Box>
  );
}
