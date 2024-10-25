'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DeleteRole } from '@/api/backend/rbac/DeleteRole';
import { type Role } from '@/api/backend/rbac/GetRoles';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { TableContainer } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PopupState from 'material-ui-popup-state';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';

interface CustomersTableProps {
  rows: Role[];
}

export function RoleTable({ rows }: CustomersTableProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const handleApiError = useHandleApiError();

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>角色</TableCell>
                <TableCell>描述</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && <EmptyTableRow />}
              {rows
                .filter((row) => {
                  const searchRole = searchParams.get('role');
                  if (!searchRole) return true;
                  return row.role.toLowerCase().includes(searchRole.toLowerCase());
                })
                .map((row) => {
                  return (
                    <TableRow hover key={row.role} selected={false}>
                      <TableCell>
                        <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                          {row.role}
                        </Stack>
                      </TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>
                        <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                          <HavePermissionsOnly permissions={['GetPermissions', 'GetRolePermissions']}>
                            <IconButton LinkComponent={Link} href={`/dashboard/roles/edit/${row.role}`}>
                              <EditIcon />
                            </IconButton>
                          </HavePermissionsOnly>
                          <HavePermissionsOnly permissions={['DeleteRole']}>
                            <PopupState variant="popover">
                              {(popupState) => (
                                <>
                                  <IconButton {...bindTrigger(popupState)}>
                                    <DeleteIcon />
                                  </IconButton>
                                  <DoubleCheckPopover
                                    {...bindPopover(popupState)}
                                    title="刪除角色"
                                    description={`您確定要刪除 ${row.role} 嗎?`}
                                    onConfirm={async () => {
                                      const res = await DeleteRole(row.role);
                                      if (res.error) {
                                        handleApiError(res.error);
                                        return;
                                      }
                                      enqueueSnackbar(`已刪除角色 ${row.role}`, { variant: 'success' });
                                      popupState.close();
                                    }}
                                    onCancel={popupState.close}
                                  />
                                </>
                              )}
                            </PopupState>
                          </HavePermissionsOnly>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}
