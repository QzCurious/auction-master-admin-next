'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { AdminUpdateConsignor } from '@/api/backend/consignor/AdminUpdateConsignor';
import { CONSIGNOR_STATUS } from '@/api/backend/static-configs.data';
import { useHandleNoPermissions } from '@/domain/permission/useHandleNoPermissions';
import { getDirtyFields } from '@/helper/getDirtyFields';
import { zodResolver } from '@hookform/resolvers/zod';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Button, Chip, Grid, InputAdornment, InputLabel, Link, MenuItem, Select, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { BigNumber } from 'bignumber.js';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { HavePermissionsOnly } from "@/domain/permission/HavePermissionsOnly";

import { statusColor } from './statusColor';

interface ConsignorFromProps {
  consignor: Consignor;
}

const FormSchema = z
  .object({
    nickname: z.string().min(1, '必填'),
    status: z.number().refine(R.isIncludedIn(CONSIGNOR_STATUS.data.map((item) => item.value)), { message: '必填' }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    commissionBonusRate: z.coerce.number().min(0).max(100),
  })
  .refine((data) => (!data.password ? true : data.password === data.confirmPassword), {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export default function ConsignorForm({ consignor }: ConsignorFromProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, dirtyFields, defaultValues },
    getValues,
  } = useForm<z.output<typeof FormSchema>>({
    values: {
      nickname: consignor.nickname,
      status: consignor.status,
      password: '',
      confirmPassword: '',
      commissionBonusRate: BigNumber(consignor.commissionBonusRate).multipliedBy(100).toNumber(),
    },
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleNoPermissions = useHandleNoPermissions();

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const fixedData = {
          ...data,
          commissionBonusRate: BigNumber(data.commissionBonusRate).dividedBy(100).toNumber(),
        };
        const dirtyValues = getDirtyFields(fixedData, dirtyFields);
        if (Object.keys(dirtyValues).length === 0) return;

        const res = await AdminUpdateConsignor(consignor.id, dirtyValues);
        if (res.error) {
          enqueueSnackbar(res.error, { variant: 'error' });
          return;
        }
        enqueueSnackbar('寄售人資訊已更新', { variant: 'success' });
        if (process.env.NODE_ENV !== 'development') {
          router.push('/dashboard/consignors');
        }
      })}
    >
      <Stack rowGap={3} sx={{ mt: 4 }}>
        <Card sx={{ py: 2, px: 3 }}>
          <Stack direction="row" columnGap={2}>
            <Typography variant="h6">寄售人資訊</Typography>
            <Box sx={{ ml: 'auto' }} />
            {process.env.NODE_ENV === 'development' && <Button onClick={() => router.refresh()}>Refetch</Button>}
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={() => {
                  console.log('values', getValues());
                  console.log('dirtyFields', dirtyFields);
                  console.log('defaultValues', defaultValues);
                }}
              >
                Log values
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              onClick={consignor ? handleNoPermissions(['UpdateAdmin']) : handleNoPermissions(['CreateAdmin'])}
            >
              送出
            </Button>
          </Stack>

          {consignor && (
            <Stack direction="row" spacing={3}>
              <HavePermissionsOnly permissions={['GetItemsAndDetails']}>
                <Link href={`/dashboard/items?consignorID=${consignor.id}`} target="_blank" rel="noreferrer">
                  <StackSimple /> 寄售人物品
                </Link>
              </HavePermissionsOnly>
              <HavePermissionsOnly permissions={['GetAuctionItems']}>
                <Link href={`/dashboard/auction-items?consignorID=${consignor.id}`} target="_blank" rel="noreferrer">
                  <Gavel /> 寄售人日拍商品
                </Link>
              </HavePermissionsOnly>
            </Stack>
          )}

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  InputProps={{ readOnly: true }}
                  label="帳號"
                  type="text"
                  value={consignor.account}
                  fullWidth
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth>
                    <InputLabel>狀態</InputLabel>
                    <Select
                      label="狀態"
                      type="text"
                      {...field}
                      renderValue={(selected) => (
                        <Chip
                          label={CONSIGNOR_STATUS.get('value', selected).message}
                          color={statusColor(selected as never)}
                        />
                      )}
                      fullWidth
                    >
                      {CONSIGNOR_STATUS.data.map(({ value, message }) => (
                        <MenuItem
                          key={value}
                          value={value}
                          disabled={
                            value === CONSIGNOR_STATUS.enum('EnabledStatus') &&
                            (!consignor.name || !consignor.identification)
                          }
                        >
                          {message}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="nickname"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField {...field} label="暱稱" type="text" fullWidth />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="commissionBonusRate"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="回饋比例"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                      }}
                      inputProps={{ step: 0.1 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      fullWidth
                      label="密碼"
                      type={showPassword ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: showPassword ? (
                          <EyeIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(false);
                            }}
                          />
                        ) : (
                          <EyeSlashIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(true);
                            }}
                          />
                        ),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      fullWidth
                      label="確認密碼"
                      type={showPassword ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: showPassword ? (
                          <EyeIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(false);
                            }}
                          />
                        ) : (
                          <EyeSlashIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={(): void => {
                              setShowPassword(true);
                            }}
                          />
                        ),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="大師幣"
                type="text"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        LinkComponent={Link}
                        size="small"
                        color="primary"
                        href={`/dashboard/consignor-balance/wallet-logs?consignorID=${consignor.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LaunchOutlinedIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={consignor.walletBalance.toLocaleString()}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="紅利"
                type="text"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        LinkComponent={Link}
                        size="small"
                        color="primary"
                        href={`/dashboard/consignor-balance/bonus-logs?consignorID=${consignor.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LaunchOutlinedIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={consignor.bonusBalance.toLocaleString()}
              />
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </form>
  );
}
