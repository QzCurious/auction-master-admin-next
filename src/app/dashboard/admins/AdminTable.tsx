'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DeleteAdmin } from '@/api/backend/admins/DeleteAdmin';
import { type Admin } from '@/api/backend/admins/GetAdmins';
import { ADMIN_STATUS } from '@/api/backend/static-configs.data';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import { HavePermissionsOnly } from "@/domain/permission/HavePermissionsOnly";
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import { statusColor } from './statusColor';

interface AdminTableProps {
  rows: Admin[];
  count: number;
}

export function AdminTable({ rows, count }: AdminTableProps) {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const account = searchParams.get('account');
  const havePermissions = useHavePermissions();

  const filteredRows = useMemo(
    () =>
      rows
        .filter((row) => {
          if (status === null) return true;
          return row.status === parseInt(status);
        })
        .filter((row) => {
          if (account === null) return true;
          return row.account.includes(account);
        }),
    [account, rows, status]
  );

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>帳號</TableCell>
                <TableCell>角色</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length === 0 && <EmptyTableRow />}
              {filteredRows.map((row) => {
                return (
                  <TableRow hover key={row.id} selected={false}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        {row.account}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
                        {row.roles.map((role) => (
                          <Chip
                            key={role}
                            component={Link}
                            href={`/dashboard/roles/edit/${role}`}
                            onClick={(e) => {
                              if (!havePermissions(['GetAdmin', 'GetPermissions'])) {
                                e.preventDefault();
                              }
                            }}
                            label={role}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={ADMIN_STATUS.get('value', row.status).message} color={statusColor(row.status)} />
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <HavePermissionsOnly permissionKeys={['GetAdmin', 'GetConfigs', 'GetRoles']}>
                          <IconButton LinkComponent={Link} href={`/dashboard/admins/edit/${row.id}`}>
                            <EditIcon />
                          </IconButton>
                        </HavePermissionsOnly>
                        <HavePermissionsOnly permissionKeys={['DeleteAdmin']}>
                          <DeleteBtn row={row} />
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

function DeleteBtn({ row }: { row: Admin }) {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <DeleteIcon />
      </IconButton>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="刪除管理員"
        description={`您確定要刪除 ${row.account} 嗎?`}
        onConfirm={async () => {
          await DeleteAdmin(row.id);
          enqueueSnackbar(`${row.account} 已刪除`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
