'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CONSIGNOR_STATUS_DATA, CONSIGNOR_STATUS_MAP } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminUpdateConsignor } from '@/api/backend/consignor/AdminUpdateConsignor';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Chip, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useHandleNoPermissions } from '@/contexts/UserContext';

import { statusColor } from './statusColor';

interface ConsignorFromProps {
  consignor: Consignor;
}

const FormSchema = z
  .object({
    nickname: z.string().min(1, '必填'),
    status: z.number(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => (!data.password ? true : data.password === data.confirmPassword), {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export default function ConsignorForm({ consignor }: ConsignorFromProps) {
  const defaultValues = useMemo(
    () => ({ nickname: consignor.nickname, status: consignor.status, password: '', confirmPassword: '' }),
    [consignor]
  );
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<z.input<typeof FormSchema>>({
    defaultValues,
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleNoPermissions = useHandleNoPermissions();

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await AdminUpdateConsignor(consignor.id, { ...data });
        if (res.error) {
          enqueueSnackbar(res.error, { variant: 'error' });
          return;
        }
        enqueueSnackbar('寄售人資訊已更新', { variant: 'success' });
        router.push('/dashboard/consignors');
      })}
    >
      <Stack rowGap={3} sx={{ mt: 4 }}>
        <Card sx={{ py: 2, px: 3 }}>
          <Stack direction="row" columnGap={2}>
            <Typography variant="h6">寄售人資訊</Typography>
            <Box sx={{ ml: 'auto' }} />
            {process.env.NODE_ENV === 'development' && (
              <Button onClick={() => console.log(getValues())}>Get form values</Button>
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
                          label={CONSIGNOR_STATUS_DATA.find(({ value }) => value === selected)?.message}
                          color={statusColor(selected as never)}
                        />
                      )}
                      fullWidth
                    >
                      {CONSIGNOR_STATUS_DATA.map(({ value, message }) => (
                        <MenuItem
                          key={value}
                          value={value}
                          disabled={
                            value === CONSIGNOR_STATUS_MAP.EnabledStatus &&
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

            <Grid item xs />

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
          </Grid>
        </Card>
      </Stack>
    </form>
  );
}
