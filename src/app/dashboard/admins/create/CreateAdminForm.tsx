'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddRoleForAdmin } from '@/api/backend/admins/AddRoleForAdmin';
import { CreateAdmin } from '@/api/backend/admins/CreateAdmin';
import { type Role } from '@/api/backend/rbac/GetRoles';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { ADMIN_STATUS } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Chip, Grid, InputLabel, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { statusColor } from '../statusColor';

interface CreateAdminFromProps {
  roles?: Role[];
}

const FormSchema = z
  .object({
    account: z
      .string()
      .min(1, '必填')
      .regex(/^[0-9a-zA-Z_.-]+$/, { message: '只能包含數字、英文字母及 _ . - 符號' }),
    status: z.number().refine(R.isIncludedIn(ADMIN_STATUS.data.map((item) => item.value))),
    password: z.string().min(1, '必填'),
    confirmPassword: z.string().min(1, '必填'),
    roles: z.string().array(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export default function CreateAdminForm({ roles }: CreateAdminFromProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, dirtyFields, defaultValues },
    getValues,
    setError,
  } = useForm<z.output<typeof FormSchema>>({
    values: {
      account: '',
      roles: [],
      status: ADMIN_STATUS.enum('EnabledStatus'),
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();
  const handleApiError = useHandleApiError();

  return (
    <form
      onSubmit={handleSubmit(
        async (data) => {
          const createAdminRes = await CreateAdmin({
            account: data.account,
            password: data.password,
            status: data.status,
          });
          if (createAdminRes.error) {
            handleApiError(createAdminRes.error);
            return;
          }
          if (havePermissions(['AddRoleForAdmin']) && data.roles.length) {
            const addRolesToAdminRes = await AddRoleForAdmin(data.account, { role: data.roles });
            if (addRolesToAdminRes.error) {
              handleApiError(addRolesToAdminRes.error);
              return;
            }
          }
          enqueueSnackbar('已建立新的管理員', { variant: 'success' });
          router.push('/dashboard/admins');
        },
        (err) => console.log(err)
      )}
    >
      <Stack rowGap={3}>
        <Card sx={{ py: 2, px: 3 }}>
          <Stack direction="row" columnGap={2}>
            <Typography variant="h6">管理員資訊</Typography>
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

            {havePermissions(['CreateAdmin']) && (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                送出
              </Button>
            )}
          </Stack>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="account"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField {...field} label="帳號" type="text" fullWidth />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>狀態</InputLabel>
                    <Select
                      {...field}
                      label="狀態"
                      value={field.value}
                      fullWidth
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip
                            key={selected}
                            label={ADMIN_STATUS.get('value', selected).message}
                            color={statusColor(selected)}
                          />
                        </Box>
                      )}
                    >
                      {ADMIN_STATUS.data.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.message}
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
                            onClick={() => {
                              setShowPassword(false);
                            }}
                          />
                        ) : (
                          <EyeSlashIcon
                            cursor="pointer"
                            fontSize="var(--icon-fontSize-md)"
                            onClick={() => {
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

            <HavePermissionsOnly permissions={['AddRoleForAdmin']}>
              {roles && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    control={control}
                    name="roles"
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>角色</InputLabel>
                        <Select
                          {...field}
                          multiple
                          input={<OutlinedInput label="角色" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                        >
                          {roles.map((r) => (
                            <MenuItem key={r.role} value={r.role}>
                              {r.role}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
            </HavePermissionsOnly>
          </Grid>
        </Card>
      </Stack>
    </form>
  );
}
