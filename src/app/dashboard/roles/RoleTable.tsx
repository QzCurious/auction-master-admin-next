'use client';

import * as React from 'react';
import { useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { deleteRole } from '@/api/backend/rbac/deleteRole';
import { type Role } from '@/api/backend/rbac/roles';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { TableContainer, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import { HavePermissionsOnly } from '@/contexts/UserContext';

interface CustomersTableProps {
  rows: Role[];
}

export function RoleTable({ rows }: CustomersTableProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = searchParams.get('tab') || 'All';

  return (
    <Card>
      {/* <Tabs
        sx={{ px: 3 }}
        value={tab}
        onChange={(_, value) => {
          const newSearchParams = new URLSearchParams(searchParams);
          if (value === 'All') newSearchParams.delete('tab');
          else newSearchParams.set('tab', value as string);
          router.replace(`${pathname}?${newSearchParams.toString()}`);
        }}
      >
        <Tab value="All" label="All" />
        <Tab value="Active" label="Active" />
        <Tab value="Inactive" label="Inactive" />
      </Tabs> */}

      {/* <Divider /> */}

      {/* <Stack direction="row" columnGap={2} sx={{ px: 2, py: 1 }}>
        <FilterButton label="Role" search="role" />

        {searchParams.size > 0 && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              router.replace(pathname);
            }}
          >
            Clear Filters
          </Button>
        )}
      </Stack> */}

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
                          <HavePermissionsOnly permissions={['AddPermissionForRole', 'DeletePermissionForRole']}>
                            <IconButton LinkComponent={Link} href={`/dashboard/roles/edit/${row.role}`}>
                              <EditIcon />
                            </IconButton>
                          </HavePermissionsOnly>
                          <HavePermissionsOnly permissions={['DeleteRole']}>
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
      </Box>
    </Card>
  );
}

function DeleteBtn({ row }: { row: Role }) {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });
  const [isPending, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <DeleteIcon />
      </IconButton>
      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: '16px 20px ' }}>
          <Typography variant="subtitle1">刪除角色</Typography>
          <Typography color="text.secondary" variant="body2">
            您確定要刪除 {row.role} 嗎?
          </Typography>
          <Stack direction="row" gap={2} justifyContent="space-between" sx={{ mt: 1 }}>
            <Button variant="text" size="small" onClick={popupState.close}>
              取消
            </Button>
            <Button
              disabled={isPending}
              variant="contained"
              size="small"
              onClick={() => {
                popupState.close();
                startTransition(async () => {
                  const res = await deleteRole(row.role);
                  if (res.error) {
                    enqueueSnackbar(`Failed to delete ${row.role}: ${res.error}`, { variant: 'error' });
                    return;
                  }
                  enqueueSnackbar(`${row.role} deleted`, { variant: 'success' });
                });
              }}
            >
              刪除
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

function FilterButton({ label, search }: { label: string; search: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = searchParams.get(search) || '';
  const popupState = usePopupState({
    variant: 'popover',
  });
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        {...bindTrigger(popupState)}
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={
          value ? (
            <RemoveCircleOutlineOutlinedIcon
              onClick={(e) => {
                e.stopPropagation();
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete(search);
                router.replace(`${pathname}?${newSearchParams.toString()}`);
                popupState.close();
              }}
            />
          ) : (
            <AddCircleOutlineOutlinedIcon />
          )
        }
      >
        {label}
        {value ? (
          <Typography color="primary" variant="subtitle2">
            : {value}
          </Typography>
        ) : (
          ''
        )}
      </Button>
      <Popover
        sx={{ mt: 1 }}
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Stack
          component="form"
          sx={{ p: '16px 20px ' }}
          gap={1}
          onSubmit={(e) => {
            e.preventDefault();
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(search, inputRef.current?.value || '');
            router.replace(`${pathname}?${newSearchParams.toString()}`);
            popupState.close();
          }}
        >
          <Typography variant="subtitle2">Filter by {label}</Typography>

          <TextField inputRef={inputRef} size="small" fullWidth placeholder={`Enter ${label}`} defaultValue={value} />

          <Button type="submit" fullWidth variant="contained">
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
}
