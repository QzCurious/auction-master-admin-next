'use client';

import Link from 'next/link';
import { type Configs } from '@/api/backend/configs';
import { ITEM_STATUS_DATA } from '@/api/backend/configs.data';
import { Divider, Tab, Tabs } from '@mui/material';

const tabs = [
  { href: '/dashboard/items/submit-appraisal-status', status: 'SubmitAppraisalStatus' },
  // { name: '審核通過', href: '/dashboard/items/appraised', status: 'AppraisedStatus' },
] satisfies Array<{
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
          <Tab
            key={x.status}
            LinkComponent={Link}
            href={x.href}
            value={x.status}
            label={ITEM_STATUS_DATA.find(({ key }) => key === x.status)?.message}
          />
        ))}
      </Tabs>
      <Divider />
    </div>
  );
}
