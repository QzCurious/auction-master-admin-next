'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';

export default function BalanceTabs() {
  const pathname = usePathname();
  const havePermissions = useHavePermissions();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={pathname === '/dashboard/consignor-balance/wallet-logs' ? '錢包紀錄' : '紅利紀錄'}>
        <Tab
          label="錢包紀錄"
          style={{ display: !havePermissions(['AdminGetWalletLogs']) ? 'none' : undefined }}
          value="錢包紀錄"
          LinkComponent={Link}
          href="/dashboard/consignor-balance/wallet-logs"
        />
        <Tab
          label="紅利紀錄"
          style={{ display: !havePermissions(['AdminGetBonusLogs']) ? 'none' : undefined }}
          value="紅利紀錄"
          LinkComponent={Link}
          href="/dashboard/consignor-balance/bonus-logs"
        />
      </Tabs>
    </Box>
  );
}
