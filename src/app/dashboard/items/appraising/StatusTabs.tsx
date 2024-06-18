'use client';

import Link from 'next/link';
import { type Configs } from '@/api/backend/configs';
import { Divider, Tab, Tabs } from '@mui/material';

const tabs = [
  { name: '已提交審核', href: '/dashboard/items/appraising', status: 'SubmitAppraisalStatus' },
  // { name: '審核通過', href: '/dashboard/items/appraised', status: 'AppraisedStatus' },
] satisfies Array<{
  name: string;
  href: string;
  status: Configs['itemStatus'][number]['key'];
}>;

interface StatusTabsProps {
  status: (typeof tabs)[number]['status'];
}

export default function StatusTabs({ status }: StatusTabsProps) {
  return (
    <div>
      <Tabs sx={{ px: 3 }} value={status}>
        {tabs.map((x) => (
          <Tab key={x.status} LinkComponent={Link} href={x.href} value={x.status} label={x.name} />
        ))}
      </Tabs>
      <Divider />
    </div>
  );
}
