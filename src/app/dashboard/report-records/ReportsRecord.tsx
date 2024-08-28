'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GetRecordsQueryOptions } from '@/api/backend/reports/GetRecords.query';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { DATE_TIME_FORMAT, ROWS_PER_PAGE } from '@/static';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, subDays, subHours } from 'date-fns';
import * as R from 'remeda';
import { unique } from 'remeda';
import { z } from 'zod';

import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { type SearchParamsSchema } from './SearchParamsSchema';

const schema = z.object({
  consignorId: z.number().nullable(),
  type: z.number().array(),
  status: z.number().array(),
  startAt: z.date(),
  endAt: z.date(),
});

export default function ReportsRecord({
  endAt = subHours(new Date(), 1),
  startAt = startOfDay(subDays(endAt, 7)),
  type,
  status,
  consignorID,
}: z.output<typeof SearchParamsSchema>) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
