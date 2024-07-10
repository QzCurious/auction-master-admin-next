'use client';

import * as React from 'react';
import { useContext, useState } from 'react';
import { UpdateAdminPassword } from '@/api/backend/admins/UpdateAdminPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { Stack } from '@mui/system';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useHandleNoPermissions, UserContext } from '@/contexts/UserContext';

const FormSchema = z
  .object({
    oldPassword: z.string().min(1, { message: '請輸入當前密碼' }),
    password: z.string().min(1, { message: '請輸入新密碼' }),
    confirmPassword: z.string().min(1, { message: '請再次輸入新密碼' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '請重新確認新密碼',
    path: ['confirmPassword'],
  });

export function UpdatePasswordForm(): React.JSX.Element {
  const user = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
    reset,
  } = useForm<z.input<typeof FormSchema>>({
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
    resolver: zodResolver(FormSchema),
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleNoPermissions = useHandleNoPermissions();

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        if (!user?.id) return;
        const res = await UpdateAdminPassword(user.id, {
          oldPassword: data.oldPassword,
          password: data.password,
        });

        if (res.error === '11') {
          setError('password', { message: '新密碼不能與舊密碼相同' });
          return;
        }
        if (res.error === '1004') {
          setError('oldPassword', { message: '舊密碼錯誤' });
          return;
        }
        if (res.error) {
          enqueueSnackbar(`密碼變更失敗: ${res.error}`, { variant: 'error' });
          return;
        }

        enqueueSnackbar('密碼變更成功', { variant: 'success' });
        reset();
      })}
    >
      <Card>
        <CardHeader subheader="修改密碼" title="密碼" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <Controller
              name="oldPassword"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField
                    {...field}
                    label="當前密碼"
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

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField
                    {...field}
                    label="新密碼"
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

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField
                    {...field}
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
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            onClick={handleNoPermissions(['UpdateAdminPassword'])}
          >
            送出
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
