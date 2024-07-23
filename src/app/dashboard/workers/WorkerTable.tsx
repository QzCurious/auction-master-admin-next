'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { WORKER_STATUS_DATA, WORKER_STATUS_MAP, WORKER_TYPE_DATA } from '@/api/backend/configs.data';
import { type Worker } from '@/api/backend/workers/GetWorkers';
import { ToggleActivateWorker } from '@/api/backend/workers/ToggleActivateWorker';
import EditIcon from '@mui/icons-material/Edit';
import { Chip, Divider, MenuItem, Select, Switch, TableContainer } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

import DeleteDialog from './DeleteDialog';

interface WorkerTableProps {
  rows: Worker[];
  count: number;
}

export function WorkerTable({ rows, count }: WorkerTableProps) {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ whiteSpace: 'nowrap' }}>
                <TableCell>登入狀態</TableCell>
                <TableCell>類型</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>帳號</TableCell>
                <TableCell>名稱</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && <EmptyTableRow />}
              {rows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.loggedIn ? '已登入' : '未登入'}</TableCell>
                  <TableCell>{WORKER_TYPE_DATA.find((data) => data.value === row.type)?.message}</TableCell>
                  <TableCell>{row.url}</TableCell>
                  <TableCell>{row.account}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.status !== WORKER_STATUS_MAP.InvalidatedStatus ? (
                      <HavePermissionsOnly permissionKeys={['ToggleActivateWorker']}>
                        <StatusSwitch row={row} />
                      </HavePermissionsOnly>
                    ) : (
                      <Chip
                        label={WORKER_STATUS_DATA.find((data) => data.value === row.status)?.message}
                        variant="outlined"
                        color="error"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <HavePermissionsOnly permissionKeys={['UpdateWorker']}>
                        <IconButton LinkComponent={Link} href={`/dashboard/workers/edit/${row.id}`}>
                          <EditIcon />
                        </IconButton>
                      </HavePermissionsOnly>
                      <HavePermissionsOnly permissionKeys={['DeleteWorker']}>
                        <DeleteDialog worker={row} />
                      </HavePermissionsOnly>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <SearchParamsPagination count={count} />
      </Box>
    </Card>
  );
}

function StatusSwitch({ row }: { row: Worker }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Switch
      checked={row.status === WORKER_STATUS_MAP.ActiveStatus}
      size="small"
      onChange={(e) => {
        startTransition(async () => {
          await ToggleActivateWorker(row.id, {
            status: e.target.checked ? WORKER_STATUS_MAP.ActiveStatus : WORKER_STATUS_MAP.AwaitingSetupCompletionStatus,
          });
        });
      }}
      disabled={isPending}
    />
  );
}

function StatusSelect({ row }: { row: Worker }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Select
      value={row.status}
      size="small"
      onChange={(e) => {
        startTransition(async () => {
          await ToggleActivateWorker(row.id, {
            status: Number(e.target.value),
          });
        });
      }}
      disabled={isPending || row.status === WORKER_STATUS_MAP.InvalidatedStatus}
    >
      {WORKER_STATUS_DATA.map(({ value, message }) => (
        <MenuItem key={value} value={value}>
          {message}
        </MenuItem>
      ))}
    </Select>
  );
}
