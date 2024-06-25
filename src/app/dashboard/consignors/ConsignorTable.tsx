'use client';

import * as React from 'react';
import Link from 'next/link';
import { CONSIGNOR_STATUS_DATA } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/consignors';
import EditIcon from '@mui/icons-material/Edit';
import { Chip, TableContainer } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import { statusColor } from './statusColor';

interface ConsignorTableProps {
  rows: Consignor[];
  count: number;
}

export function ConsignorTable({ rows, count }: ConsignorTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>帳號</TableCell>
                <TableCell>暱稱</TableCell>
                <TableCell>手機</TableCell>
                <TableCell>銀行代碼</TableCell>
                <TableCell>銀行帳號</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && <EmptyTableRow />}
              {rows.map((row) => {
                return (
                  <TableRow hover key={row.id} selected={false}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        {row.account}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        {row.nickname}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        {row.phone}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        {row.bankCode}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        {row.bankAccount}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                        <Chip
                          label={CONSIGNOR_STATUS_DATA.find(({ value }) => value === row.status)?.message}
                          color={statusColor(row.status)}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <HavePermissionsOnly permissionKeys={['AdminUpdateConsignor']}>
                          <IconButton LinkComponent={Link} href={`/dashboard/consignors/edit/${row.id}`}>
                            <EditIcon />
                          </IconButton>
                        </HavePermissionsOnly>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <SearchParamsPagination count={count} />
      </Box>
    </Card>
  );
}
