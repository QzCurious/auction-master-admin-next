'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AddPermissionForRole } from '@/api/backend/rbac/AddPermissionForRole';
import { CreateRole } from '@/api/backend/rbac/CreateRole';
import { DeletePermissionForRole } from '@/api/backend/rbac/DeletePermissionForRole';
import { type GetPermissions } from '@/api/backend/rbac/GetPermissions';
import { type RolePermissions } from '@/api/backend/rbac/GetRolesPermission';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useHavePermissions } from '@/contexts/UserContext';

interface RoleFromProps {
  // edit
  role?: RolePermissions;
  permissions: Awaited<ReturnType<typeof GetPermissions>>['data'];
}

const FormSchema = z.object({
  role: z.string().min(1, '必填'),
  description: z.string().min(1, '必填'),
  permissionKey: z.string().array(),
});

export default function RoleForm({ role, permissions }: RoleFromProps) {
  const defaultValues = useMemo(
    () => ({
      role: '',
      description: '',
      ...role,
      permissionKey: role?.permission.map((p) => p.key) ?? [],
    }),
    [role]
  );
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    getValues,
    reset,
  } = useForm<z.input<typeof FormSchema>>({
    defaultValues,
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(
        role
          ? async (data) => {
              const addPermissions = data.permissionKey.filter(
                (key) => !role.permission.map((p) => p.key).includes(key as never)
              );
              const removePermissions = role.permission
                .filter((p) => !data.permissionKey.includes(p.key))
                .map((p) => p.key);
              const res = await Promise.all([
                AddPermissionForRole({ role: data.role, permissionKey: addPermissions }),
                DeletePermissionForRole({ role: data.role, permissionKey: removePermissions }),
              ]);
              const errors = res.filter((x) => !!x && !!x.error).map((res) => res.error);
              if (errors.length) {
                for (const error of errors) {
                  enqueueSnackbar(error, { variant: 'error' });
                }
                return;
              }

              enqueueSnackbar('角色已更新', { variant: 'success' });
              if (process.env.NODE_ENV !== 'development') {
                router.push('/dashboard/roles');
              }
            }
          : async (data) => {
              const createRoleRes = await CreateRole({
                role: data.role,
                description: data.description,
              });
              if (createRoleRes.error === '1000') {
                setError('role', { message: '角色名稱已存在' });
                return;
              }
              if (createRoleRes.error) {
                enqueueSnackbar(createRoleRes.error, { variant: 'error' });
                return;
              }

              if (havePermissions(['AddPermissionForRole'])) {
                const addPermissionsForRoleRes = await AddPermissionForRole({
                  role: data.role,
                  permissionKey: data.permissionKey,
                });
                if (addPermissionsForRoleRes.error) {
                  enqueueSnackbar(addPermissionsForRoleRes.error, { variant: 'error' });
                  return;
                }
              }

              enqueueSnackbar('角色已建立', { variant: 'success' });
              router.push('/dashboard/roles');
            }
      )}
    >
      <Card sx={{ mt: 4 }}>
        <CardHeader title="角色資訊" subheader="管理角色名稱及該角色的簡介描述" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Controller
              control={control}
              name="role"
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error}>
                  <TextField inputProps={{ readOnly: !!role }} {...field} label="角色名稱" type="text" fullWidth />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error}>
                  <TextField
                    inputProps={{ readOnly: !!role }}
                    {...field}
                    fullWidth
                    multiline
                    label="角色描述"
                    type="text"
                    margin="normal"
                    rows={4}
                  />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Stack>
        </CardContent>
        <Divider />

        {(role || (!role && havePermissions(['AddPermissionForRole']))) && permissions && (
          <>
            <CardHeader title="權限設定" subheader="角色的權限授權範圍" />
            <Divider />
            <CardContent>
              <Controller
                control={control}
                name="permissionKey"
                render={({ field }) => (
                  <Grid container spacing={4}>
                    {permissions.map((group) => (
                      <Grid item key={group.message}>
                        <Stack direction="row" alignItems="center">
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={group.permissions.every((p) => field.value.includes(p.key))}
                                indeterminate={
                                  group.permissions.some((p) => field.value.includes(p.key)) &&
                                  !group.permissions.every((p) => field.value.includes(p.key))
                                }
                                onChange={(event) => {
                                  if (!role && !havePermissions(['AddPermissionForRole'])) {
                                    return;
                                  }
                                  if (role && !havePermissions(['AddPermissionForRole', 'DeletePermissionForRole'])) {
                                    return;
                                  }

                                  if (event.target.checked) {
                                    field.onChange([
                                      ...new Set([...field.value, ...group.permissions.map((p) => p.key)]),
                                    ]);
                                  } else {
                                    field.onChange(
                                      field.value.filter((key) => !group.permissions.some((p) => p.key === key))
                                    );
                                  }
                                }}
                              />
                            }
                            label={group.message}
                            componentsProps={{ typography: { variant: 'body1', fontWeight: 'bold' } }}
                          />
                          <Divider sx={{ flexGrow: 1 }} />
                        </Stack>

                        <Stack
                          direction="column"
                          flexWrap="wrap"
                          columnGap={1}
                          maxHeight={300}
                          sx={{ overflow: 'auto' }}
                        >
                          {group.permissions.map((permission) => (
                            <React.Fragment key={permission.key}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={field.value.includes(permission.key)}
                                    onChange={(event) => {
                                      if (!role && !havePermissions(['AddPermissionForRole'])) {
                                        return;
                                      }
                                      if (
                                        role &&
                                        !havePermissions(['AddPermissionForRole', 'DeletePermissionForRole'])
                                      ) {
                                        return;
                                      }

                                      if (event.target.checked) {
                                        field.onChange([...field.value, permission.key]);
                                      } else {
                                        field.onChange(field.value.filter((key) => key !== permission.key));
                                      }
                                    }}
                                  />
                                }
                                label={permission.description}
                                componentsProps={{ typography: { variant: 'body2' } }}
                              />
                            </React.Fragment>
                          ))}
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                )}
              />
            </CardContent>
            <Divider />
          </>
        )}
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          {process.env.NODE_ENV === 'development' && (
            <Button onClick={() => console.log(getValues())}>Get form values</Button>
          )}

          {(!role || (role && havePermissions(['AddPermissionForRole', 'DeletePermissionForRole']))) && (
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              送出
            </Button>
          )}
        </CardActions>
      </Card>
    </form>
  );
}
