'use client';

import React, { useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { AddPermissionForRole } from '@/api/backend/rbac/AddPermissionForRole';
import { DeletePermissionForRole } from '@/api/backend/rbac/DeletePermissionForRole';
import { type Permission, type PermissionGroup } from '@/api/backend/rbac/GetPermissions';
import { type RolePermissions } from '@/api/backend/rbac/GetRolePermissions';
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
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

interface EditRoleFromProps {
  role: string;
  rolePermissions: RolePermissions;
  permissionGroups: PermissionGroup[];
}

const FormSchema = z.object({
  permissions: z.record(z.string(), z.string().array()),
});

export default function EditRoleForm({ role, rolePermissions, permissionGroups }: EditRoleFromProps) {
  const router = useRouter();
  const formMethods = useForm<z.output<typeof FormSchema>>({
    values: {
      permissions: {
        ...R.mapToObj(
          permissionGroups.flatMap((p) => p.permissions),
          (p) => [p.key, []]
        ),
        ...(rolePermissions ? R.mapToObj(rolePermissions.permission, (p) => [p.key, p.fields]) : {}),
      },
    },
    resolver: zodResolver(FormSchema),
  });
  const {
    formState: { isSubmitting, defaultValues },
    getValues,
  } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();

  return (
    <FormProvider {...formMethods}>
      <FormSubmissionWithDirtyFields<z.output<typeof FormSchema>>
        onValid={async (data, dirtyFields) => {
          if (!dirtyFields.permissions) return;

          const addPermissions =
            havePermissions(['AddPermissionForRole']) &&
            R.pipe(
              data.permissions,
              R.pick(R.keys(dirtyFields.permissions)),
              R.entries(),
              R.map(([k, v]) => ({ key: k, fields: v })),
              R.map((p) => {
                const rp = rolePermissions.permission.find((rp) => rp.key === p.key);
                if (!rp) return p;
                return { key: p.key, fields: R.difference(p.fields, rp.fields) };
              })
            );
          const deletePermissions =
            havePermissions(['DeletePermissionForRole']) &&
            R.pipe(
              rolePermissions.permission,
              R.filter((rp) => rp.key in (dirtyFields.permissions ?? {})),
              R.map((rp) => {
                const p = data.permissions[rp.key];
                if (!p) return rp;
                return { key: rp.key, fields: R.difference(rp.fields, p) };
              })
            );

          const res = await Promise.all([
            addPermissions && addPermissions.length && AddPermissionForRole({ role, permissions: addPermissions }),
            deletePermissions &&
              deletePermissions.length &&
              DeletePermissionForRole({ role, permissions: deletePermissions }),
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
        }}
      >
        <Card>
          <CardHeader title="角色資訊" subheader="管理角色名稱及該角色的簡介描述" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <FormControl>
                <TextField inputProps={{ readOnly: true }} value={role} label="角色名稱" type="text" fullWidth />
              </FormControl>

              <FormControl>
                <TextField
                  inputProps={{ readOnly: true }}
                  value={rolePermissions.description}
                  fullWidth
                  multiline
                  label="角色描述"
                  type="text"
                  margin="normal"
                  rows={4}
                />
              </FormControl>
            </Stack>
          </CardContent>
          <Divider />

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

            {havePermissions(['AddPermissionForRole', 'DeletePermissionForRole']) && (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                送出
              </Button>
            )}
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
  const havePermissions = useHavePermissions();

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
              if (!havePermissions(['AddPermissionForRole', 'DeletePermissionForRole'])) return;
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
  const havePermissions = useHavePermissions();

  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={field.value.length === permission.fields.length}
            indeterminate={field.value.length > 0 && field.value.length < permission.fields.length}
            onChange={(event) => {
              if (!havePermissions(['AddPermissionForRole', 'DeletePermissionForRole'])) return;
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
                  if (!havePermissions(['AddPermissionForRole', 'DeletePermissionForRole'])) return;
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
