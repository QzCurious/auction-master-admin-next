/* eslint-disable no-param-reassign */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addMonths, closestTo, startOfDay, subDays, subHours, subMonths } from 'date-fns';
import { type z } from 'zod';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import { ConsignorSelect } from '@/components/ConsignorSelect';

import { type SearchParamsSchema } from './SearchParamsSchema';

const MAX_MONTHS = 3;

function isValidInterval(startAt: Date, endAt: Date) {
  return startAt && endAt && startAt <= endAt && addMonths(startAt, MAX_MONTHS) >= endAt;
}

export default function Filters({
  endAt = subHours(new Date(), 1),
  startAt = startOfDay(subDays(endAt, 7)),
  type,
  status,
  consignorID,
}: z.output<typeof SearchParamsSchema>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  if (!isValidInterval(startAt, endAt)) {
    endAt = subHours(new Date(), 1);
    startAt = startOfDay(subDays(endAt, 7));
  }

  return (
    <Stack direction="row" spacing={3}>
      <DateTimePicker
        value={startAt}
        onAccept={(v) => {
          if (v && isValidInterval(v, endAt)) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('startAt', v.toISOString());
            router.replace(`?${newSearchParams.toString()}`);
          }
        }}
        label="起始時間"
        format="yyyy/MM/dd HH:00"
        minDateTime={endAt ? subMonths(endAt, 3) : undefined}
        maxDateTime={endAt ?? new Date()}
        slotProps={{ field: { readOnly: true } }}
        ampm={false}
        views={['year', 'month', 'day', 'hours']}
      />

      <DateTimePicker
        value={endAt}
        onAccept={(v) => {
          if (v && isValidInterval(startAt, v)) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('endAt', v.toISOString());
            router.replace(`?${newSearchParams.toString()}`);
          }
        }}
        label="結束時間"
        format="yyyy/MM/dd HH:00"
        minDateTime={startAt ?? undefined}
        maxDateTime={
          startAt
            ? closestTo(startAt, [addMonths(startAt, MAX_MONTHS), subHours(new Date(), 1)])
            : subHours(new Date(), 1)
        }
        slotProps={{ field: { readOnly: true } }}
        ampm={false}
        views={['year', 'month', 'day', 'hours']}
      />

      <HavePermissionsOnly permissionKeys={['AdminGetConsignor', 'AdminGetConsignors']}>
        <ConsignorSelect
          sx={{ width: 215 }}
          textFieldProps={{ label: '寄售人暱稱' }}
          value={consignorID ?? null}
          onChange={(id) => {
            const newSearchParams = new URLSearchParams(searchParams);
            if (!id) newSearchParams.delete('consignorID');
            else newSearchParams.set('consignorID', id.toString());
            router.replace(`?${newSearchParams.toString()}`);
          }}
        />
      </HavePermissionsOnly>

      <FormControl>
        <InputLabel shrink>類型</InputLabel>
        <Select
          label="類型"
          multiple
          displayEmpty
          value={type}
          inputProps={{ sx: { minWidth: 240, maxWidth: 360 } }}
          onChange={(e) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('type');
            for (const v of e.target.value) newSearchParams.append('type', v.toString());
            router.replace(`?${newSearchParams.toString()}`);
          }}
          renderValue={(selected) =>
            selected.length === 0 ? (
              <Typography color="text.secondary" fontStyle="italic">
                全部
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((v) => (
                  <Chip key={v} label={RECORD_TYPE.get('value', v).message} />
                ))}
              </Box>
            )
          }
        >
          {RECORD_TYPE.data.map(({ value, message }) => (
            <MenuItem key={value} value={value}>
              {message}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel shrink>狀態</InputLabel>
        <Select
          label="狀態"
          multiple
          displayEmpty
          value={status}
          inputProps={{ sx: { minWidth: 240, maxWidth: 360 } }}
          onChange={(e) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('status');
            for (const v of e.target.value) newSearchParams.append('status', v.toString());
            router.replace(`?${newSearchParams.toString()}`);
          }}
          renderValue={(selected) =>
            selected.length === 0 ? (
              <Typography color="text.secondary" fontStyle="italic">
                全部
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((v) => (
                  <Chip key={v} label={RECORD_STATUS.get('value', v).message} />
                ))}
              </Box>
            )
          }
        >
          {RECORD_STATUS.data.map(({ value, message }) => (
            <MenuItem key={value} value={value}>
              {message}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
