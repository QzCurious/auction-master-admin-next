'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { CONSIGNOR_VERIFICATION_STATUS_DATA } from '@/api/backend/configs.data';
import { acceptConsignorVerification } from '@/api/backend/consignor/acceptConsignorVerification';
import { type ConsignorVerification } from '@/api/backend/consignor/consignorVerifications';
import { rejectConsignorVerification } from '@/api/backend/consignor/rejectConsignorVerification';
import { zodResolver } from '@hookform/resolvers/zod';
import EditNoteIcon from '@mui/icons-material/EditNote';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  TableContainer,
  TextField,
} from '@mui/material';
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
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

interface ConsignorVerificationTableProps {
  rows: ConsignorVerification[];
  count: number;
}

export function ConsignorVerificationTable({ rows, count }: ConsignorVerificationTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                {process.env.NODE_ENV === 'development' && <TableCell>id</TableCell>}
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
                    {process.env.NODE_ENV === 'development' && <TableCell>{row.id}</TableCell>}
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                        <span>{row.nickname}</span>
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
                        <span>{CONSIGNOR_VERIFICATION_STATUS_DATA.find((x) => x.value === row.status)?.message}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <HavePermissionsOnly permissionKeys={['HandleConsignorVerification']}>
                          <AuditBtn consignorVerification={row} />
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

const AuditSchema = z.object({
  name: z.string().min(1, '必填'),
  identification: z.string().min(1, '必填'),
});
function AuditBtn({ consignorVerification }: { consignorVerification: ConsignorVerification }) {
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.input<typeof AuditSchema>>({
    defaultValues: {
      name: '',
      identification: '',
    },
    resolver: zodResolver(AuditSchema),
  });
  const [isPending, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <EditNoteIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <DialogTitle>寄售人身份驗證</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <FormControl fullWidth>
              <TextField
                label="暱稱"
                type="text"
                InputProps={{ readOnly: true }}
                value={consignorVerification.nickname}
                fullWidth
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="手機"
                type="text"
                InputProps={{ readOnly: true }}
                value={consignorVerification.phone}
                fullWidth
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="銀行代碼"
                type="text"
                InputProps={{ readOnly: true }}
                value={consignorVerification.bankCode}
                fullWidth
              />
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="銀行戶號"
                type="text"
                InputProps={{ readOnly: true }}
                value={consignorVerification.bankAccount}
                fullWidth
              />
            </FormControl>

            <img src={consignorVerification.photo} alt="" />

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField {...field} label="姓名" type="text" fullWidth />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="identification"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField {...field} label="身分證字號" type="text" fullWidth />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            disabled={isPending}
            variant="outlined"
            color="error"
            onClick={() => {
              startTransition(async () => {
                const res = await rejectConsignorVerification(consignorVerification.id);
                if (res.error) {
                  enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error' });
                  return;
                }
                setOpen(false);
                enqueueSnackbar('已拒絕', { variant: 'success' });
              });
            }}
          >
            拒絕
          </Button>
          <Button
            type="button"
            disabled={isPending}
            variant="contained"
            color="primary"
            onClick={handleSubmit((data) => {
              startTransition(async () => {
                const res = await acceptConsignorVerification(consignorVerification.id, data);
                if (res.error === '1005') {
                  setError('name', { message: '姓名與寄售人輸入資料不一致' });
                  return;
                }
                if (res.error === '1006') {
                  setError('identification', { message: '身分證字號與寄售人輸入資料不一致' });
                  return;
                }
                if (res.error === '1604') {
                  enqueueSnackbar(`此身份驗證申請不存在: ${res.error}`, { variant: 'error' });
                  return;
                }
                if (res.error) {
                  enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error' });
                  return;
                }
                setOpen(false);
                enqueueSnackbar('已通過', { variant: 'success' });
              });
            })}
          >
            送出
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
