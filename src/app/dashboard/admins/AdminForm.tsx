'use client';

import { useState } from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { createAdmin } from '@/api/backend/admins/createAdmin';
import { type Admin } from '@/api/backend/admins/getAdmin';
import { updateAdmin } from '@/api/backend/admins/updateAdmin';
import { type Data as BackendConfigs } from '@/api/backend/configs';
import { addRolesToAdmin } from '@/api/backend/rbac/addRolesToAdmin';
import { removeRolesFromAdmin } from '@/api/backend/rbac/removeRolesFromAdmin';
import { type Role } from '@/api/backend/rbac/roles';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, Chip, Grid, InputLabel, Link, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
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

interface AdminFromProps {
  // edit
  admin?: Admin;
  adminStatus?: BackendConfigs['adminStatus'];
  roles: Role[];
}

const CreateFormSchema = z
  .object({
    account: z.string().min(1, 'Account is required'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    roles: z.string().array(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const EditFormSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
    status: z.number().optional(),
    roles: z.string().array(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function AdminForm({ admin, adminStatus, roles }: AdminFromProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm({
    defaultValues: {
      account: '',
      roles: [],
      ...admin,
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(admin ? EditFormSchema : CreateFormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <form
      onSubmit={handleSubmit(
        admin
          ? async (data) => {
              await updateAdmin(admin.id, {
                password: data.password,
                status: data.status ?? admin.status,
              });
              await addRolesToAdmin(admin.account, { roles: data.roles.filter((role) => !admin.roles.includes(role)) });
              await removeRolesFromAdmin(admin.account, {
                roles: admin.roles.filter((role) => !data.roles.includes(role)),
              });
              enqueueSnackbar('Admin updated', { variant: 'success' });
              router.push('/dashboard/admins');
            }
          : async (data) => {
              await createAdmin({
                account: data.account,
                password: data.password,
              });
              await addRolesToAdmin(data.account, { roles: data.roles });
              enqueueSnackbar('Admin created', { variant: 'success' });
              router.push('/dashboard/admins');
            }
      )}
    >
      <Link component={RouterLink} href="/dashboard/admins">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> Admins
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        {admin ? 'Edit Admin' : 'Create Admin'}
      </Typography>

      <Stack rowGap={3} sx={{ mt: 4 }}>
        <Card sx={{ py: 2, px: 3 }}>
          <Stack direction="row" columnGap={2}>
            <Typography variant="h6">Account information</Typography>
            <Box sx={{ ml: 'auto' }} />
            {process.env.NODE_ENV === 'development' && (
              <Button onClick={() => console.log(getValues())}>Get form values</Button>
            )}
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Submit
            </Button>
          </Stack>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <Controller
                control={control}
                name="account"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField {...field} label="Admin" type="text" fullWidth />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              {adminStatus && (
                <Controller
                  control={control}
                  name="status"
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status" fullWidth>
                        {adminStatus.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.message}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              )}
            </Grid>

            <Grid item xs={6}>
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
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

            <Grid item xs={6}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm password"
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

            <Grid item xs={6}>
              <Controller
                control={control}
                name="roles"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>Roles</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
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
