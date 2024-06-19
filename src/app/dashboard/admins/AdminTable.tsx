'use client';

import * as React from 'react';
import { useMemo, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type Admin } from '@/api/backend/admins/admins';
import { deleteAdmin } from '@/api/backend/admins/deleteAdmin';
import { ADMIN_STATUS_DATA } from '@/api/backend/configs.data';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Chip, TableContainer, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
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

import { HavePermissionsOnly, useHavePermissions } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

interface AdminTableProps {
  rows: Admin[];
  count: number;
}

export function AdminTable({ rows, count }: AdminTableProps): React.JSX.Element {
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
      {/* <Tabs
        sx={{ px: 3 }}
        value={status ?? 'All'}
        onChange={(_, value) => {
          const newSearchParams = new URLSearchParams(searchParams);
          if (value === 'All') newSearchParams.delete('status');
          else newSearchParams.set('status', value as string);
          router.replace(`${pathname}?${newSearchParams.toString()}`);
        }}
      >
        <Tab value="All" label="全部" />
        {adminStatus.map((x) => (
          <Tab key={x.value} value={x.value.toString()} label={x.message} />
        ))}
      </Tabs> */}

      {/* <Stack direction="row" columnGap={2} sx={{ px: 2, py: 1 }}>
        <FilterButton label="Account" search="account" />

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

      {/* <Divider /> */}

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
                    <TableCell>{ADMIN_STATUS_DATA.find((x) => x.value === row.status)?.message}</TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <HavePermissionsOnly permissionKeys={['UpdateAdmin']}>
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
          <Typography variant="subtitle1">刪除管理員</Typography>
          <Typography color="text.secondary" variant="body2">
            您確定要刪除 {row.account} 嗎?
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
                  await deleteAdmin(row.id);
                  enqueueSnackbar(`${row.account} deleted`, { variant: 'success' });
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
            <RemoveCircleOutlineIcon
              onClick={(e) => {
                e.stopPropagation();
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete(search);
                router.replace(`${pathname}?${newSearchParams.toString()}`);
                popupState.close();
              }}
            />
          ) : (
            <AddCircleOutlineIcon />
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
