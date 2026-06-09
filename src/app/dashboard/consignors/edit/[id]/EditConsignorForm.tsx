'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { AdminUpdateConsignor } from '@/api/backend/consignor/AdminUpdateConsignor';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { database } from '@/domain/static/address.data';
import { CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';
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
import { DatePicker } from '@mui/x-date-pickers';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { BigNumber } from 'bignumber.js';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { statusColor } from '../../statusColor';

interface EditConsignorFromProps {
  consignor: Consignor;
}

const FormSchemaNotYetVerified = z
  .object({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    commissionBonusRate: z.coerce.number().min(0, '不可為負數').max(100, '不可超過 100'),
    name: z.string().min(1, { message: '必填' }),
    identification: z.string().min(1, { message: '必填' }),
    gender: z.coerce.number().refine((v) => v === 1 || v === 2, { message: '必填' }),
    birthday: z.coerce.date({ message: '必填' }),
    city: z.string().min(1, { message: '必填' }),
    district: z.string().min(1, { message: '必填' }),
    streetAddress: z.string().min(1, { message: '必填' }),
    phone: z.string().min(1, { message: '必填' }),
    beneficiaryName: z.string().min(1, { message: '必填' }),
    bankCode: z.string().min(1, { message: '必填' }),
    bankAccount: z.string().min(1, { message: '必填' }),
    status: z.number().refine(R.isIncludedIn(CONSIGNOR_STATUS.data.map((item) => item.value)), { message: '必填' }),
  })
  .refine((data) => (!data.password ? true : data.password === data.confirmPassword), {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

const FormSchema = z
  .object({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    commissionBonusRate: z.coerce.number().min(0, '不可為負數').max(100, '不可超過 100'),
    name: z.string().min(1, { message: '必填' }),
    identification: z.string().min(1, { message: '必填' }),
    gender: z.coerce.number().refine((v) => v === 1 || v === 2, { message: '必填' }),
    birthday: z.coerce.date({ message: '必填' }),
    city: z.string().min(1, { message: '必填' }),
    district: z.string().min(1, { message: '必填' }),
    streetAddress: z.string().min(1, { message: '必填' }),
    phone: z.string().min(1, { message: '必填' }),
    beneficiaryName: z.string().min(1, { message: '必填' }),
    bankCode: z.string().min(1, { message: '必填' }),
    bankAccount: z.string().min(1, { message: '必填' }),
    status: z.number().refine(R.isIncludedIn(CONSIGNOR_STATUS.data.map((item) => item.value)), { message: '必填' }),
  })
  .refine((data) => (!data.password ? true : data.password === data.confirmPassword), {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export default function EditConsignorForm({ consignor }: EditConsignorFromProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, dirtyFields, defaultValues },
    getValues,
    setValue,
  } = useForm<z.output<typeof FormSchema>>({
    values: {
      password: '',
      confirmPassword: '',
      commissionBonusRate: BigNumber(consignor.commissionBonusRate).multipliedBy(100).toNumber(),
      name: consignor.name,
      identification: consignor.identification,
      gender: consignor.gender,
      birthday: new Date(consignor.birthday),
      city: consignor.city,
      district: consignor.district,
      streetAddress: consignor.streetAddress,
      phone: consignor.phone,
      beneficiaryName: consignor.beneficiaryName ?? '',
      bankCode: consignor.bankCode,
      bankAccount: consignor.bankAccount,
      status: consignor.status,
    },
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();
  const handleApiError = useHandleApiError();

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
          handleApiError(res.error);
          return;
        }

        enqueueSnackbar('寄售人資訊已更新', { variant: 'success' });
        if (process.env.NODE_ENV !== 'development') {
          router.push('/dashboard/consignors');
        }
      })}
    >
      <Stack rowGap={3}>
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

            <HavePermissionsOnly permissions={['AdminUpdateConsignor']}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                送出
              </Button>
            </HavePermissionsOnly>
          </Stack>

          <Stack direction="row" spacing={3}>
            <HavePermissionsOnly permissions={['GetItemsAndDetails']}>
              <Link href={`/dashboard/items?consignorId=${consignor.id}`} target="_blank" rel="noreferrer">
                <StackSimple /> 寄售人物品
              </Link>
            </HavePermissionsOnly>
            <HavePermissionsOnly permissions={['GetAuctionItems']}>
              <Link href={`/dashboard/auction-items?consignorId=${consignor.id}`} target="_blank" rel="noreferrer">
                <Gavel /> 寄售人日拍商品
              </Link>
            </HavePermissionsOnly>
          </Stack>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="大師幣"
                type="text"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <HavePermissionsOnly permissions={['AdminGetWalletLogs']}>
                      <InputAdornment position="end">
                        <IconButton
                          LinkComponent={Link}
                          size="small"
                          color="primary"
                          href={`/dashboard/consignor-balance/wallet-logs?consignorId=${consignor.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LaunchOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    </HavePermissionsOnly>
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
                    <HavePermissionsOnly permissions={['AdminGetBonusLogs']}>
                      <InputAdornment position="end">
                        <IconButton
                          LinkComponent={Link}
                          size="small"
                          color="primary"
                          href={`/dashboard/consignor-balance/bonus-logs?consignorId=${consignor.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LaunchOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    </HavePermissionsOnly>
                  ),
                }}
                value={consignor.bonusBalance.toLocaleString()}
              />
            </Grid>

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
                      readOnly={!havePermissions([{ key: 'AdminUpdateConsignor', fields: ['status'] }])}
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
              <FormControl fullWidth>
                <TextField
                  value={consignor.nickname}
                  label="暱稱"
                  type="text"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </FormControl>
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
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['commissionBonusRate'] }]),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <HavePermissionsOnly permissions={[{ key: 'AdminUpdateConsignor', fields: ['password'] }]}>
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
            </HavePermissionsOnly>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="姓名"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['name'] }]),
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
                name="gender"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>性別</InputLabel>
                    <Select
                      label="性別"
                      type="text"
                      {...field}
                      readOnly={!havePermissions([{ key: 'AdminUpdateConsignor', fields: ['gender'] }])}
                      fullWidth
                    >
                      <MenuItem value={1}>男</MenuItem>
                      <MenuItem value={2}>女</MenuItem>
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="birthday"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <DatePicker
                      {...field}
                      label="生日"
                      format="yyyy/MM/dd"
                      readOnly={!havePermissions([{ key: 'AdminUpdateConsignor', fields: ['birthday'] }])}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="identification"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="身分證字號"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['identification'] }]),
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
                name="phone"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="手機號碼"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['phone'] }]),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs />

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="city"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>縣市</InputLabel>
                    <Select
                      label="縣市"
                      type="text"
                      {...field}
                      onChange={(v) => {
                        field.onChange(v);
                        setValue('district', '');
                      }}
                      readOnly={!havePermissions([{ key: 'AdminUpdateConsignor', fields: ['city'] }])}
                      fullWidth
                    >
                      {Object.keys(database).map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
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
                name="district"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>區域</InputLabel>
                    <Select
                      label="區域"
                      type="text"
                      {...field}
                      readOnly={!havePermissions([{ key: 'AdminUpdateConsignor', fields: ['district'] }])}
                      fullWidth
                    >
                      {watch('city') &&
                        Object.keys(database[watch('city') as keyof typeof database]).map((v) => (
                          <MenuItem key={v} value={v}>
                            {v}
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
                name="streetAddress"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="地址"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['streetAddress'] }]),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs />

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="bankCode"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="銀行代碼"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['bankCode'] }]),
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
                name="bankAccount"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="銀行戶號"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['bankAccount'] }]),
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
                name="beneficiaryName"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="銀行戶名"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'AdminUpdateConsignor', fields: ['beneficiaryName'] }]),
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
