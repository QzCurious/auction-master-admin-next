'use client';

import * as React from 'react';
import Link from 'next/link';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { CONSIGNOR_STATUS } from '@/api/backend/static-configs.data';
import { currencySign, toPercent } from '@/static';
import EditIcon from '@mui/icons-material/Edit';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
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

import { HavePermissionsOnly } from "@/domain/permission/HavePermissionsOnly";
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
                <TableCell>銀行帳號</TableCell>
                <TableCell sx={{ width: 0 }}>大師幣/紅利</TableCell>
                <TableCell>回饋比例</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && <EmptyTableRow />}
              {rows.map((row) => {
                return (
                  <TableRow hover key={row.id} selected={false}>
                    <TableCell>{row.account}</TableCell>
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
                      {!!row.bankCode && !!row.bankAccount && (
                        <>
                          ({row.bankCode}) {row.bankAccount}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <table style={{ whiteSpace: 'nowrap', minWidth: '100%' }}>
                        <tbody>
                          <tr>
                            <td width={0}>大師幣</td>
                            <td style={{ width: '100%', paddingLeft: '0.5rem', textAlign: 'right' }}>
                              {currencySign('JPY')}
                              {row.walletBalance.toLocaleString()}
                            </td>
                            <td width={0}>
                              <IconButton
                                LinkComponent={Link}
                                size="small"
                                color="primary"
                                href={`/dashboard/consignor-balance/wallet-logs?consignorID=${row.id}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <LaunchOutlinedIcon fontSize="small" />
                              </IconButton>
                            </td>
                          </tr>
                          <tr>
                            <td width={0}>紅利</td>
                            <td style={{ width: '100%', paddingLeft: '0.5rem', textAlign: 'right' }}>
                              {currencySign('JPY')}
                              {row.bonusBalance.toLocaleString()}
                            </td>
                            <td width={0}>
                              <IconButton
                                LinkComponent={Link}
                                size="small"
                                color="primary"
                                href={`/dashboard/consignor-balance/bonus-logs?consignorID=${row.id}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <LaunchOutlinedIcon fontSize="small" />
                              </IconButton>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{toPercent(row.commissionBonusRate)}</TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                        <Chip
                          label={CONSIGNOR_STATUS.get('value', row.status).message}
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
