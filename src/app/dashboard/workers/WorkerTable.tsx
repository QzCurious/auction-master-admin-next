'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { type Worker } from '@/api/backend/workers/GetWorkers';
import { SetWorkerCookie } from '@/api/backend/workers/SetWorkerCookie';
import { ToggleActivateWorker } from '@/api/backend/workers/ToggleActivateWorker';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { type PaginationSearchParams } from '@/domain/static/static';
import { WORKER_STATUS, WORKER_TYPE } from '@/domain/static/static-config-mappers';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  Popover,
  Select,
  Switch,
  TableContainer,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { enqueueSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';

import EmptyTableRow from '@/components/EmptyTableRow';

import DeleteDialog from './DeleteDialog';

interface WorkerTableProps extends PaginationSearchParams {
  rows: Worker[];
  count: number;
}

export function WorkerTable({ page, rowsPerPage, rows, count }: WorkerTableProps) {
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
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      {row.loggedIn ? (
                        <div>
                          <Box
                            sx={{
                              display: 'inline-block',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor:
                                row.loggedInName === row.name
                                  ? 'var(--mui-palette-success-main)'
                                  : 'var(--mui-palette-warning-main)',
                              mr: 0.5,
                            }}
                          />
                          已登入
                        </div>
                      ) : (
                        <div>
                          <Box
                            sx={{
                              display: 'inline-block',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--mui-palette-error-main)',
                              mr: 0.5,
                            }}
                          />
                          未登入
                        </div>
                      )}
                      {row.type === 'Watcher' && (
                        <HavePermissionsOnly permissions={['SetWorkerCookie']}>
                          <CookieInputPopover row={row} />
                        </HavePermissionsOnly>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{WORKER_TYPE.get('value', row.type).message}</TableCell>
                  <TableCell>{row.url}</TableCell>
                  <TableCell>{row.account}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.status !== WORKER_STATUS.enum('InvalidatedStatus') ? (
                      <HavePermissionsOnly permissions={['ToggleActivateWorker']}>
                        <StatusSwitch row={row} />
                      </HavePermissionsOnly>
                    ) : (
                      <Chip label={WORKER_STATUS.get('value', row.status).message} variant="outlined" color="error" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <HavePermissionsOnly permissions={['GetWorker']}>
                        <IconButton LinkComponent={Link} href={`/dashboard/workers/edit/${row.id}`}>
                          <EditIcon />
                        </IconButton>
                      </HavePermissionsOnly>
                      <HavePermissionsOnly permissions={['DeleteWorker']}>
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
        <SearchParamsPagination page={page} rowsPerPage={rowsPerPage} count={count} />
      </Box>
    </Card>
  );
}

function StatusSwitch({ row }: { row: Worker }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Switch
      checked={row.status === WORKER_STATUS.enum('ActiveStatus')}
      size="small"
      onChange={(e) => {
        startTransition(async () => {
          await ToggleActivateWorker(row.id, {
            status: e.target.checked
              ? WORKER_STATUS.enum('ActiveStatus')
              : WORKER_STATUS.enum('AwaitingSetupCompletionStatus'),
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
      disabled={isPending || row.status === WORKER_STATUS.enum('InvalidatedStatus')}
    >
      {WORKER_STATUS.data.map(({ value, message }) => (
        <MenuItem key={value} value={value}>
          {message}
        </MenuItem>
      ))}
    </Select>
  );
}

function CookieInputPopover({ row }: { row: Worker }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      cookies: '',
    },
  });
  const popupState = usePopupState({
    variant: 'popover',
  });
  const handleApiError = useHandleApiError();

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <CookieOutlinedIcon />
      </IconButton>
      <Popover
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        {...bindPopover(popupState)}
      >
        <Box
          component="form"
          sx={{ p: '16px 20px' }}
          onSubmit={handleSubmit(async (data) => {
            const res = await SetWorkerCookie(row.id, data.cookies);
            if (res.error) {
              handleApiError(res.error);
              return;
            }
            enqueueSnackbar('登入 cookies 已設定', { variant: 'success' });
            popupState.close();
          })}
        >
          <Typography variant="subtitle1">設定登入 cookies</Typography>
          <FormControl sx={{ mt: 1 }}>
            <Controller
              name="cookies"
              control={control}
              rules={{ required: '請輸入 cookies' }}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField {...field} label="cookies" size="small" type="text" fullWidth multiline rows={3} />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </FormControl>

          <Stack direction="row" gap={2} justifyContent="end" sx={{ mt: 1 }}>
            <Button
              type="button"
              variant="outlined"
              size="small"
              color="error"
              onClick={() => {
                popupState.close();
                reset();
              }}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="contained" size="small">
              確定
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
