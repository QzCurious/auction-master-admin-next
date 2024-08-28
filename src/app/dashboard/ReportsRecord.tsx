'use client';

import { useEffect, useState } from 'react';
import { GetRecordsSummaryQueryOptions } from '@/api/backend/reports/GetRecordsSummary.query';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { addMonths, closestTo, startOfDay, subDays, subHours, subMonths } from 'date-fns';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import { ConsignorSelect } from '@/components/ConsignorSelect';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

const MAX_MONTHS = 3;

function isValidInterval(startAt: Date, endAt: Date) {
  return startAt && endAt && startAt <= endAt && addMonths(startAt, MAX_MONTHS) >= endAt;
}

export default function ReportsRecord() {
  const [endAt, setEndAt] = useState(() => subHours(new Date(), 1));
  const [startAt, setStartAt] = useState(() => startOfDay(subDays(endAt, 7)));
  const [consignorID, setConsignorID] = useState<number | null>(null);
  const [type, setType] = useState<RECORD_TYPE['value'][]>([]);
  const [status, setStatus] = useState<RECORD_STATUS['value'][]>([]);

  const [range, setRange] = useState({ startAt, endAt });
  useEffect(() => {
    if (isValidInterval(startAt, endAt)) {
      setRange({ startAt, endAt });
    }
  }, [endAt, startAt]);

  return (
    <Card>
      <CardHeader title="Reports" />
      <CardContent>
        <Stack direction="row" spacing={3}>
          <DateTimePicker
            value={startAt}
            onAccept={(v) => (v ? setStartAt(v) : undefined)}
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
            onAccept={(v) => (v ? setEndAt(v) : undefined)}
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
              value={consignorID}
              onChange={setConsignorID}
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
              onChange={({ target: { value } }) => setType(value as RECORD_TYPE['value'][])}
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
              onChange={({ target: { value } }) => setStatus(value as RECORD_STATUS['value'][])}
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

        <Summery {...range} type={type} consignorID={consignorID} status={status} />
      </CardContent>
    </Card>
  );
}

function Summery({
  startAt,
  endAt,
  consignorID,
  type,
  status,
}: {
  startAt: Date;
  endAt: Date;
  consignorID: number | null;
  type: RECORD_TYPE['value'][];
  status: RECORD_STATUS['value'][];
}) {
  const { data, error, isPending } = useQuery({
    ...GetRecordsSummaryQueryOptions({ startAt, endAt, consignorID: consignorID ?? undefined, type, status }),
    placeholderData: keepPreviousData,
  });

  if (isPending) return <Box mt={3}>Loading...</Box>;

  if (error) return null;
  if (data.error === '1001') return <WithoutPermissionsError permissions={['GetRecordsSummary']} />;
  if (data.error === '1003') return <RedirectAuthError />;

  return (
    <Grid container gap={4} mt={4}>
      <Grid>
        <Card>
          <CardHeader title="JPY" />
          <Table size="small">
            <TableBody>
              {Object.entries(data.data.JPY).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell>{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Grid>

      <Grid>
        <Card>
          <CardHeader title="TWD" />
          <Table size="small">
            <TableBody>
              {Object.entries(data.data.TWD).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell>{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Grid>
    </Grid>
  );
}
