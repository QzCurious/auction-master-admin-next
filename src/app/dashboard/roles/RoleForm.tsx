'use client';

import { useRouter } from 'next/navigation';
import { Permission } from '@/api/backend/rbac/permissions';
import { type RolePermissions } from '@/api/backend/rbac/rolesPermissions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useHandleNoPermissions } from '@/contexts/UserContext';

import { createRoleAction, updatePermissionsToRoleAction } from './actions';

interface RoleFromProps {
  // edit
  role?: RolePermissions;
  permissions: Permission[];
}

const FormSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  description: z.string().min(1, 'Description is required'),
  permissionKey: z.string().array(),
});

export default function RoleForm({ role, permissions }: RoleFromProps) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<z.input<typeof FormSchema>>({
    defaultValues: {
      role: '',
      description: '',
      ...role,
      permissionKey: role?.permission.map((p) => p.key) ?? [],
    },
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleNoPermissions = useHandleNoPermissions();

  return (
    <form
      onSubmit={handleSubmit(
        role
          ? async (data) => {
              const errors = await updatePermissionsToRoleAction({
                role: data.role,
                addPermissions: data.permissionKey.filter(
                  (key) => !role.permission.map((p) => p.key).includes(key as never)
                ),
                removePermissions: role.permission.filter((p) => !data.permissionKey.includes(p.key)).map((p) => p.key),
              });

              if (errors) {
                for (const error of errors) {
                  enqueueSnackbar(error, { variant: 'error' });
                }
                return;
              }

              enqueueSnackbar('Role updated', { variant: 'success' });
              router.push('/dashboard/roles');
            }
          : async (data) => {
              await createRoleAction(data);
              enqueueSnackbar('Role created', { variant: 'success' });
              router.push('/dashboard/roles');
            }
      )}
    >
      <Stack rowGap={3} sx={{ mt: 4 }}>
        <Card sx={{ py: 2, px: 3 }}>
          <Stack direction="column" rowGap={2}>
            <Stack direction="row" columnGap={2}>
              <Typography variant="h6">帳號資訊</Typography>
              <Box sx={{ ml: 'auto' }} />
              {process.env.NODE_ENV === 'development' && (
                <Button onClick={() => console.log(getValues())}>Get form values</Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                onClick={
                  role
                    ? handleNoPermissions(['AddPermissionForRole', 'DeletePermissionForRole'])
                    : handleNoPermissions(['CreateRole'])
                }
              >
                送出
              </Button>
            </Stack>

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
        </Card>

        <Card>
          <Stack direction="column" rowGap={2}>
            <Typography variant="h6" sx={{ pt: 2, px: 3 }}>
              權限
            </Typography>

            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: '800px' }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                    <TableCell sx={{ p: 0, pl: 1 }}>
                      <Controller
                        control={control}
                        name="permissionKey"
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={field.value.length === permissions.length}
                            indeterminate={field.value.length > 0 && field.value.length < permissions.length}
                            onChange={(event) => {
                              if (event.target.checked) {
                                field.onChange(permissions.map((p) => p.key));
                              } else {
                                field.onChange([]);
                              }
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell title="key">權限</TableCell>
                    <TableCell>描述</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((row) => {
                    return (
                      <TableRow hover key={row.key}>
                        <TableCell sx={{ p: 0, pl: 1 }}>
                          <Controller
                            control={control}
                            name="permissionKey"
                            render={({ field }) => (
                              <Checkbox
                                {...field}
                                checked={field.value.includes(row.key)}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    field.onChange([...field.value, row.key]);
                                  } else {
                                    field.onChange(field.value.filter((p) => p !== row.key));
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>{row.key}</TableCell>
                        <TableCell>{row.description}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </form>
  );
}
