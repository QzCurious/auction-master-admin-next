'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE } from '@/domain/static/static';
import { Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addMonths, closestTo, format, isValid, startOfDay, subMonths } from 'date-fns';

import { FilterPopover } from '@/components/FilterPopover';

interface RangeFilterProps {
  startAt?: Date;
  endAt?: Date;
  within?: { months: number };
}

export function RangeFilter({ startAt, endAt, within }: RangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [range, setRange] = useState({ startAt, endAt });

  useEffect(() => {
    if (!startAt || !endAt) {
      setRange({ startAt: undefined, endAt: undefined });
    }
  }, [endAt, startAt]);

  return (
    <FilterPopover
      label="區間"
      value={
        startAt && endAt && startAt <= endAt && addMonths(startAt, within?.months ?? 0) >= startOfDay(endAt)
          ? `${format(startAt, 'yyyy/MM/dd HH:mm')} ~ ${format(endAt, 'yyyy/MM/dd HH:mm')}`
          : null
      }
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('startAt');
        newSearchParams.delete('endAt');
        newSearchParams.delete(PAGE);
        router.push(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <Stack direction="row" spacing={3}>
          <DateTimePicker
            value={range.startAt ?? null}
            onChange={(v) => {
              if (!v) {
                setRange((prev) => ({ ...prev, startAt: undefined }));
                return;
              }
              if (!isValid(v)) {
                return;
              }

              setRange((prev) => ({ ...prev, startAt: v }));
              if (v && range.endAt) {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('startAt', v.toISOString());
                newSearchParams.set('endAt', range.endAt.toISOString());
                router.replace(`?${newSearchParams}`);
              }
            }}
            label="起始時間"
            format="yyyy/MM/dd HH:mm"
            minDateTime={range.endAt && within ? subMonths(range.endAt, within.months) : undefined}
            maxDateTime={range.endAt ?? new Date()}
            slotProps={{
              field: { clearable: true },
              // textField: { error: !range.startAt && range.endAt ? true : undefined },
            }}
            timeSteps={{ minutes: 1 }}
            ampm={false}
            views={['year', 'month', 'day', 'hours', 'minutes']}
          />

          <DateTimePicker
            value={range.endAt ?? null}
            onChange={(v) => {
              if (!v) {
                setRange((prev) => ({ ...prev, endAt: undefined }));
                return;
              }
              if (!isValid(v)) {
                return;
              }

              setRange((prev) => ({ ...prev, endAt: v }));
              if (range.startAt && v) {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('startAt', range.startAt.toISOString());
                newSearchParams.set('endAt', v.toISOString());
                router.replace(`?${newSearchParams}`);
              }
            }}
            label="結束時間"
            format="yyyy/MM/dd HH:mm"
            minDateTime={range.startAt ?? undefined}
            maxDateTime={
              range.startAt && within
                ? closestTo(range.startAt, [addMonths(range.startAt, within.months), new Date()])
                : new Date()
            }
            slotProps={{
              field: { clearable: true },
              // textField: { error: range.startAt && !range.endAt ? true : undefined },
            }}
            timeSteps={{ minutes: 1 }}
            ampm={false}
            views={['year', 'month', 'day', 'hours', 'minutes']}
          />
        </Stack>
      )}
    </FilterPopover>
  );
}
