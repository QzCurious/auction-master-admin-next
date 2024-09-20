'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addMonths, closestTo, isValid, subMonths } from 'date-fns';
import { type z } from 'zod';

import { MAX_MONTHS, validRange, type SearchParamsSchema } from './SearchParamsSchema';

export default function Filters({ endAt, startAt, action, consignorID }: z.output<typeof SearchParamsSchema>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [range, setRange] = useState({ startAt, endAt });

  return (
    <Stack direction="row" spacing={3}>
      <DateTimePicker
        value={range.startAt ?? null}
        onChange={(v) => {
          if (!v) {
            setRange({ startAt: undefined, endAt: undefined });
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('startAt');
            newSearchParams.delete('endAt');
            router.replace(`?${newSearchParams.toString()}`);
            return;
          }
          if (!isValid(v)) {
            return;
          }

          setRange((prev) => ({ ...prev, startAt: v }));
          if (validRange(v, range.endAt)) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('startAt', v.toISOString());
            newSearchParams.set('endAt', range.endAt!.toISOString());
            router.replace(`?${newSearchParams.toString()}`);
          }
        }}
        label="起始時間"
        format="yyyy/MM/dd HH:mm"
        minDateTime={range.endAt ? subMonths(range.endAt, MAX_MONTHS) : undefined}
        maxDateTime={range.endAt ?? new Date()}
        slotProps={{
          field: { clearable: true },
          textField: { error: !range.startAt && range.endAt ? true : undefined },
        }}
        timeSteps={{ minutes: 1 }}
        ampm={false}
        views={['year', 'month', 'day', 'hours', 'minutes']}
      />

      <DateTimePicker
        value={range.endAt ?? null}
        onChange={(v) => {
          if (!v) {
            setRange({ startAt: undefined, endAt: undefined });
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('startAt');
            newSearchParams.delete('endAt');
            router.replace(`?${newSearchParams.toString()}`);
            return;
          }
          if (!isValid(v)) {
            return;
          }

          setRange((prev) => ({ ...prev, endAt: v }));
          if (validRange(range.startAt, v)) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('startAt', range.startAt!.toISOString());
            newSearchParams.set('endAt', v.toISOString());
            router.replace(`?${newSearchParams.toString()}`);
          }
        }}
        label="結束時間"
        format="yyyy/MM/dd HH:mm"
        minDateTime={range.startAt ?? undefined}
        maxDateTime={
          range.startAt ? closestTo(range.startAt, [addMonths(range.startAt, MAX_MONTHS), new Date()]) : new Date()
        }
        slotProps={{
          field: { clearable: true },
          textField: { error: range.startAt && !range.endAt ? true : undefined },
        }}
        timeSteps={{ minutes: 1 }}
        ampm={false}
        views={['year', 'month', 'day', 'hours', 'minutes']}
      />
    </Stack>
  );
}
