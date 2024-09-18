'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WALLET_ACTION } from '@/api/backend/static-configs.data';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addMonths, closestTo, isValid, subMonths } from 'date-fns';
import { type z } from 'zod';

import { HavePermissionsOnly } from "@/domain/permission/HavePermissionsOnly";
import { ConsignorSelect } from '@/components/ConsignorSelect';

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
        <InputLabel shrink>操作</InputLabel>
        <Select
          label="操作"
          multiple
          displayEmpty
          value={action}
          inputProps={{ sx: { minWidth: 240, maxWidth: 360 } }}
          onChange={(e) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('action');
            for (const v of e.target.value) newSearchParams.append('action', v.toString());
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
                  <Chip key={v} label={WALLET_ACTION.get('value', v).message} />
                ))}
              </Box>
            )
          }
        >
          {WALLET_ACTION.data.map(({ value, message }) => (
            <MenuItem key={value} value={value}>
              {message}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
