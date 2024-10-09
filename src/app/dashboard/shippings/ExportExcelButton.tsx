'use client';

import { appendEntries } from '@/domain/crud/appendEntries';
import { Button } from '@mui/material';

export default function ExportExcelButton(q: {
  auctionId?: string[];
  status?: number[];
  startAt?: Date;
  endAt?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
  offset: number;
}) {
  const query = new URLSearchParams();
  appendEntries(query, q);

  return (
    <Button type="button" variant="text" size="small" href={`/dashboard/shippings/api/export?${query}`} download>
      匯出
    </Button>
  );
}
