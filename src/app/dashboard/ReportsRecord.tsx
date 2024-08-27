'use client';

import { useEffect, useState } from 'react';
import { GetRecordsQueryOptions } from '@/api/backend/reports/GetRecords.query';
import { type Reports } from '@/api/backend/reports/GetRecordsSummary';
import { GetRecordsSummaryQueryOptions } from '@/api/backend/reports/GetRecordsSummary.query';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { DATE_TIME_FORMAT, ROWS_PER_PAGE } from '@/static';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useQuery } from '@tanstack/react-query';
import { addMonths, closestTo, format, startOfDay, subDays, subHours, subMonths } from 'date-fns';
import * as R from 'remeda';
import { unique } from 'remeda';
import { z } from 'zod';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import { ConsignorSelect } from '@/components/ConsignorSelect';
import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

const MAX_MONTHS = 3;

function isValidInterval(startAt: Date, endAt: Date) {
  return startAt && endAt && startAt <= endAt && addMonths(startAt, MAX_MONTHS) >= endAt;
}

const schema = z.object({
  consignorId: z.number().nullable(),
  type: z.number().array(),
  status: z.number().array(),
  startAt: z.date(),
  endAt: z.date(),
});

export default function ReportsRecord() {
  const [currency, setCurrency] = useState<keyof Reports>('JPY');
  const [endAt, setEndAt] = useState(() => subHours(new Date(), 1));
  const [startAt, setStartAt] = useState(() => startOfDay(subDays(endAt, 7)));
  const [type, setType] = useState<RECORD_TYPE['value'][]>([]);
  const [consignorID, setConsignorID] = useState<number | null>(null);

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

          {/* <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>
            <MenuItem value="JPY">JPY</MenuItem>
            <MenuItem value="TWD">TWD</MenuItem>
          </Select> */}

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
        </Stack>

        <Summery {...range} type={type} consignorID={consignorID} />
        <RecordList {...range} type={type} consignorID={consignorID} />
      </CardContent>
    </Card>
  );
}

function Summery({
  startAt,
  endAt,
  type,
  consignorID,
}: {
  startAt: Date;
  endAt: Date;
  type: RECORD_TYPE['value'][];
  consignorID: number | null;
}) {
  const { data, error, isPending } = useQuery(
    GetRecordsSummaryQueryOptions({ startAt, endAt, type, consignorID: consignorID ?? undefined })
  );

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

function RecordList({
  startAt,
  endAt,
  type,
  consignorID,
}: {
  startAt: Date;
  endAt: Date;
  type: RECORD_TYPE['value'][];
  consignorID: number | null;
}) {
  const { data, error, isPending } = useQuery(
    GetRecordsQueryOptions({ startAt, endAt, type, consignorID: consignorID ?? undefined })
  );
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
  });

  if (isPending) return <Box mt={3}>Loading...</Box>;

  if (error) return null;
  if (data.error === '1001') return <WithoutPermissionsError permissions={['GetRecords']} />;
  if (data.error === '1003') return <RedirectAuthError />;

  return (
    <TableContainer sx={{ overflowX: 'auto', mt: 4 }}>
      <Table sx={{ minWidth: '800px' }}>
        <TableHead>
          <TableRow sx={{ whiteSpace: 'nowrap' }}>
            <TableCell>寄售人</TableCell>
            <TableCell>類型</TableCell>
            <TableCell>細節</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.data.records.length === 0 && <EmptyTableRow />}
          {data.data.records
            .slice(
              pagination.page * pagination.rowsPerPage,
              pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
            )
            .map((row) => (
              <TableRow hover key={row.id}>
                <TableCell title={row.consignorID.toString()}>{row.consignorNickname}</TableCell>
                <TableCell>{RECORD_TYPE.get('value', row.type).message}</TableCell>
                <TableCell>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {R.entries(row).map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell>{k}</TableCell>
                            <TableCell>
                              {k === 'type' ? (
                                <>
                                  ({v}) {RECORD_TYPE.enum(v)}
                                </>
                              ) : k === 'status' ? (
                                <>
                                  ({v}) {RECORD_STATUS.enum(v)}
                                </>
                              ) : k === 'createdAt' || k === 'updatedAt' ? (
                                format(new Date(v), DATE_TIME_FORMAT)
                              ) : k === 'itemID' ? (
                                <Link href={`/dashboard/items/edit/${v}`} target="_blank">
                                  {v}
                                </Link>
                              ) : (
                                v
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TableCell>
              </TableRow>
            ))}
          <TableRow hidden />
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={unique([pagination.rowsPerPage, 5, 10, 20, 30]).sort((a, b) => a - b)}
        labelRowsPerPage="每頁顯示筆數"
        labelDisplayedRows={({ from, to, count }) => `${from} ~ ${to}, 共 ${count} 筆`}
        component="div"
        count={data.data.records.length}
        rowsPerPage={pagination[ROWS_PER_PAGE]}
        page={pagination.page}
        onPageChange={(_, newPage) => {
          setPagination({
            page: newPage,
            rowsPerPage: pagination.rowsPerPage,
          });
        }}
        onRowsPerPageChange={(event) => {
          setPagination({
            page: 0,
            rowsPerPage: Number(event.target.value),
          });
        }}
      />
    </TableContainer>
  );
}
