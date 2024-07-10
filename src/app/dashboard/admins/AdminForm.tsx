'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdmin } from '@/api/backend/admins/createAdmin';
import { type Admin } from '@/api/backend/admins/getAdmin';
import { updateAdmin } from '@/api/backend/admins/updateAdmin';
import { ADMIN_STATUS_DATA } from '@/api/backend/configs.data';
import { addRolesForAdmin } from '@/api/backend/rbac/addRolesForAdmin';
import { deleteRolesForAdmin } from '@/api/backend/rbac/deleteRolesForAdmin';
import { type Role } from '@/api/backend/rbac/roles';
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
import { z } from 'zod';

import { useHavePermissions } from '@/contexts/UserContext';

import { statusColor } from '../consignors/statusColor';

interface AdminFromProps {
  // edit
  admin?: Admin;
  roles: Role[];
}

const CreateFormSchema = z
  .object({
    account: z.string().min(1, '必填'),
    password: z.string().min(1, '必填'),
    confirmPassword: z.string().min(1, '必填'),
    status: z.number({ message: '必填' }),
    roles: z.string().array(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

const EditFormSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
    status: z.number(),
    roles: z.string().array(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export default function AdminForm({ admin, roles }: AdminFromProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const defaultValues = useMemo(
    () => ({
      account: '',
      roles: [],
      status: null,
      ...admin,
      password: '',
      confirmPassword: '',
    }),
    [admin]
  );
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(admin ? EditFormSchema : CreateFormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(
        admin
          ? async (data) => {
              const addPermissions = data.roles.filter((role) => !admin.roles.includes(role));
              const deletedPermissions = admin.roles.filter((role) => !data.roles.includes(role));
              const res = await Promise.all([
                havePermissions(['UpdateAdmin']) &&
                  updateAdmin(admin.id, {
                    status: data.status ?? admin.status,
                    password: data.password
                  }),
                havePermissions(['AddRoleForAdmin']) &&
                  addPermissions.length &&
                  addRolesForAdmin(admin.account, {
                    roles: addPermissions,
                  }),
                havePermissions(['DeleteRoleForAdmin']) &&
                  deletedPermissions.length &&
                  deleteRolesForAdmin(admin.account, {
                    roles: deletedPermissions,
                  }),
              ]);
              const errors = res.filter((x) => !!x && !!x.error).map((res) => res.error);
              if (errors.length) {
                for (const error of errors) {
                  enqueueSnackbar(error, { variant: 'error' });
                }
                return;
              }
              enqueueSnackbar('管理員資訊已更新', { variant: 'success' });
            }
          : async (data) => {
              const createAdminRes = await createAdmin({
                account: data.account,
                password: data.password,
              });
              if (createAdminRes.error) {
                enqueueSnackbar(createAdminRes.error, { variant: 'error' });
                return;
              }
              if (havePermissions(['AddRoleForAdmin']) && data.roles.length) {
                const addRolesToAdminRes = await addRolesForAdmin(data.account, { roles: data.roles });
                if (addRolesToAdminRes.error) {
                  enqueueSnackbar(addRolesToAdminRes.error, { variant: 'error' });
                  return;
                }
              }
              enqueueSnackbar('已建立新的管理員', { variant: 'success' });
              router.push('/dashboard/admins');
            }
      )}
    >
      <Stack rowGap={3} sx={{ mt: 4 }}>
        <Card sx={{ py: 2, px: 3 }}>
          <Stack direction="row" columnGap={2}>
            <Typography variant="h6">管理員資訊</Typography>
            <Box sx={{ ml: 'auto' }} />
            {process.env.NODE_ENV === 'development' && (
              <Button onClick={() => console.log(getValues())}>Get form values</Button>
            )}
            {(!admin ||
              (admin && havePermissions(['UpdateAdmin'])) ||
              (admin && havePermissions(['AddRoleForAdmin', 'DeleteRoleForAdmin']))) && (
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
                    <TextField {...field} InputProps={{ readOnly: !!admin }} label="帳號" type="text" fullWidth />
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
                      label="Status"
                      value={field.value ?? ('' as const)}
                      fullWidth
                      readOnly={admin && !havePermissions(['UpdateAdmin'])}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip
                            key={selected}
                            label={ADMIN_STATUS_DATA.find(({ value }) => value === selected)?.message}
                            color={statusColor(selected as never)}
                          />
                        </Box>
                      )}
                    >
                      {ADMIN_STATUS_DATA.map((status) => (
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
                        readOnly: admin && !havePermissions(['UpdateAdmin']),
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
                        readOnly: admin && !havePermissions(['UpdateAdmin']),
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

            <Grid
              item
              xs={12}
              sm={6}
              display={!admin && !havePermissions(['AddRoleForAdmin']) ? 'none' : undefined}
            >
              <Controller
                control={control}
                name="roles"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>角色</InputLabel>
                    <Select
                      {...field}
                      readOnly={admin && !havePermissions(['AddRoleForAdmin', 'DeleteRoleForAdmin'])}
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
          </Grid>
        </Card>
      </Stack>
    </form>
  );
}
