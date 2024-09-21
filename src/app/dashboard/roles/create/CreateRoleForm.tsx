'use client';

import React, { useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { AddPermissionForRole } from '@/api/backend/rbac/AddPermissionForRole';
import { CreateRole } from '@/api/backend/rbac/CreateRole';
import { type Permission, type PermissionGroup } from '@/api/backend/rbac/GetPermissions';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { FormSubmissionWithDirtyFields } from '@/helper/FormSubmissionWithDirtyFields';
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
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';
import { Controller, FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

interface CreateRoleFromProps {
  permissionGroups?: PermissionGroup[];
}

const FormSchema = z.object({
  role: z.string().min(1, '必填'),
  description: z.string().min(1, '必填'),
  permissions: z.record(z.string(), z.string().array()),
});

export default function CreateRoleForm({ permissionGroups }: CreateRoleFromProps) {
  const router = useRouter();
  const formMethods = useForm<z.output<typeof FormSchema>>({
    values: {
      role: '',
      description: '',
      permissions: {
        ...R.mapToObj(permissionGroups?.flatMap((p) => p.permissions) ?? [], (p) => [p.key, []]),
      },
    },
    resolver: zodResolver(FormSchema),
  });
  const {
    control,
    setError,
    formState: { isSubmitting, defaultValues },
    getValues,
  } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();

  return (
    <FormProvider {...formMethods}>
      <FormSubmissionWithDirtyFields<z.output<typeof FormSchema>>
        onValid={async (data) => {
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
              permissions: R.pipe(
                data.permissions,
                R.entries(),
                R.map(([k, v]) => ({ key: k, fields: v }))
              ),
            });
            if (addPermissionsForRoleRes.error) {
              enqueueSnackbar(addPermissionsForRoleRes.error, { variant: 'error' });
              return;
            }
          }

          enqueueSnackbar('角色已建立', { variant: 'success' });
          router.push('/dashboard/roles');
        }}
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
                    <TextField {...field} label="角色名稱" type="text" fullWidth />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormControl error={!!fieldState.error}>
                    <TextField {...field} fullWidth multiline label="角色描述" type="text" margin="normal" rows={4} />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Stack>
          </CardContent>
          <Divider />

          {permissionGroups && havePermissions(['AddPermissionForRole']) && (
            <>
              <CardHeader title="權限設定" subheader="角色的權限授權範圍" />
              <Divider />
              <CardContent>
                <Grid container spacing={4}>
                  {permissionGroups.map((group) => (
                    <Grid item key={group.message} xs={12} sm={6} md={4}>
                      <Group title={group.message} permissions={group.permissions} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
              <Divider />
            </>
          )}
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            {process.env.NODE_ENV === 'development' && <Button onClick={() => router.refresh()}>Refetch</Button>}
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={() => {
                  console.log('values', getValues());
                  console.log('defaultValues', defaultValues);
                }}
              >
                Log values
              </Button>
            )}

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              送出
            </Button>
          </CardActions>
        </Card>
      </FormSubmissionWithDirtyFields>
    </FormProvider>
  );
}

function Group({ title, permissions }: { title: string; permissions: Permission[] }) {
  const { watch, getValues, setValue } = useFormContext<z.output<typeof FormSchema>>();
  function checkedReducer() {
    const values = getValues();
    const allCount = R.sum(permissions.map((p) => p.fields.length));
    const checkedCount = R.pipe(values.permissions, R.pick(permissions.map((p) => p.key)), R.values(), R.flat()).length;
    if (allCount === checkedCount) {
      return 'all';
    }
    if (checkedCount === 0) {
      return 'none';
    }
    return 'some';
  }
  const [checked, updateChecked] = useReducer(checkedReducer, null, checkedReducer);

  useEffect(() => {
    const sub = watch(() => updateChecked());
    return () => sub.unsubscribe();
  }, [watch]);

  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={checked === 'all'}
            indeterminate={checked === 'some'}
            onChange={(event) => {
              if (event.target.checked) {
                for (const p of permissions) {
                  setValue(`permissions.${p.key}`, p.fields, { shouldDirty: true, shouldTouch: true });
                }
              } else {
                for (const p of permissions) {
                  setValue(`permissions.${p.key}`, [], { shouldDirty: true, shouldTouch: true });
                }
              }
            }}
          />
        }
        label={title}
        componentsProps={{ typography: { variant: 'body1', fontWeight: 'bold' } }}
      />

      <Stack direction="column" flexWrap="wrap" columnGap={1}>
        {permissions.map((permission) => (
          <React.Fragment key={permission.key}>
            <PermissionFields permission={permission} />
          </React.Fragment>
        ))}
      </Stack>
    </div>
  );
}

function PermissionFields({ permission }: { permission: Permission }) {
  const { control } = useFormContext<z.output<typeof FormSchema>>();
  const { field } = useController({
    control,
    name: `permissions.${permission.key}`,
  });

  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={field.value.length === permission.fields.length}
            indeterminate={field.value.length > 0 && field.value.length < permission.fields.length}
            onChange={(event) => {
              if (event.target.checked) {
                field.onChange(permission.fields);
              } else {
                field.onChange([]);
              }
            }}
          />
        }
        label={
          <Stack sx={{ color: '#667085' }} direction="row" spacing={1}>
            <div>{permission.description}</div>
            <div>{process.env.NODE_ENV === 'development' && permission.key}</div>
          </Stack>
        }
        componentsProps={{ typography: { variant: 'body2' } }}
      />
      <Box ml={1} pl={2.5}>
        {permission.fields.map((f) => (
          <FormControlLabel
            key={f}
            control={
              <Checkbox
                size="small"
                checked={field.value.includes(f)}
                onChange={(event) => {
                  if (event.target.checked) {
                    field.onChange([...field.value, f]);
                  } else {
                    field.onChange(field.value.filter((v) => v !== f));
                  }
                }}
              />
            }
            label={<Box sx={{ color: '#667085' }}>{f}</Box>}
            componentsProps={{ typography: { variant: 'body2' } }}
          />
        ))}
      </Box>
    </div>
  );
}
