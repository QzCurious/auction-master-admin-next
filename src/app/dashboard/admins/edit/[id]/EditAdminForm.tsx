'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddRoleForAdmin } from '@/api/backend/admins/AddRoleForAdmin';
import { DeleteRoleForAdmin } from '@/api/backend/admins/DeleteRoleForAdmin';
import { type Admin } from '@/api/backend/admins/GetAdmin';
import { UpdateAdmin } from '@/api/backend/admins/UpdateAdmin';
import { type Role } from '@/api/backend/rbac/GetRoles';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
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

import { statusColor } from '../../../consignors/statusColor';

interface EditAdminFromProps {
  admin: Admin;
  roles?: Role[];
}

const FormSchema = z
  .object({
    status: z.number().refine(R.isIncludedIn(ADMIN_STATUS.data.map((item) => item.value))),
    password: z.string(),
    confirmPassword: z.string(),
    roles: z.string().array(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export default function EditAdminForm({ admin, roles }: EditAdminFromProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, dirtyFields, defaultValues },
    getValues,
  } = useForm<z.output<typeof FormSchema>>({
    values: {
      ...admin,
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
          const dirtyValues = getDirtyFields(data, dirtyFields);
          if (Object.keys(dirtyValues).length === 0) return;

          const addPermissions =
            havePermissions(['AddRoleForAdmin']) && data.roles.filter((role) => !admin.roles.includes(role));
          const deletedPermissions =
            havePermissions(['DeleteRoleForAdmin']) && admin.roles.filter((role) => !data.roles.includes(role));

          const res = await Promise.all([
            (dirtyFields.status || dirtyFields.password) &&
              havePermissions(['UpdateAdmin']) &&
              UpdateAdmin(admin.id, {
                status: dirtyFields.status ? (data.status ?? admin.status) : undefined,
                password: dirtyFields.password ? data.password : undefined,
              }),
            addPermissions && addPermissions.length && AddRoleForAdmin(admin.account, { role: addPermissions }),
            deletedPermissions &&
              deletedPermissions.length &&
              DeleteRoleForAdmin(admin.account, { role: deletedPermissions }),
          ]);
          const errors = res.filter((x) => !!x && !!x.error).map((res) => res.error);
          if (errors.length) {
            for (const error of errors) {
              handleApiError(error);
            }
            return;
          }
          enqueueSnackbar('管理員資訊已更新', { variant: 'success' });
          if (process.env.NODE_ENV !== 'development') {
            router.push('/dashboard/admins');
          }
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

            {(havePermissions(['UpdateAdmin']) || havePermissions(['AddRoleForAdmin', 'DeleteRoleForAdmin'])) && (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                送出
              </Button>
            )}
          </Stack>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField value={admin.account} InputProps={{ readOnly: true }} label="帳號" type="text" fullWidth />
              </FormControl>
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
                      readOnly={!havePermissions([{ key: 'UpdateAdmin', fields: ['status'] }])}
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

            <HavePermissionsOnly permissions={[{ key: 'UpdateAdmin', fields: ['password'] }]}>
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
            </HavePermissionsOnly>

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
                        readOnly={!havePermissions(['AddRoleForAdmin', 'DeleteRoleForAdmin'])}
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
          </Grid>
        </Card>
      </Stack>
    </form>
  );
}
