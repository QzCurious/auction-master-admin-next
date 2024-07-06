'use client';

import { useState } from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { session } from '@/api/session';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { paths } from '@/paths';

const Schema = z.object({
  account: z.string().min(1, { message: 'Account is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<z.input<typeof Schema>>({
    defaultValues: {
      account: '',
      password: '',
    },
    resolver: zodResolver(Schema),
  });
  const router = useRouter();

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">登入</Typography>
      </Stack>
      {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
      <form
        onSubmit={handleSubmit(async (data) => {
          const res = await session(data);
          if (res.error === '1004' || res.error === '1502') {
            setError('root', { message: '帳號或密碼錯誤' });
            return;
          }
          if (res.error === '1001') {
            setError('root', { message: '沒有權限' });
            return;
          }
          if (res.error === '1002') {
            setError('root', { message: '此帳號為禁用狀態，無法登入' });
            return;
          }
          const goto = new URLSearchParams(location.search).get('goto');
          router.replace(goto || '/dashboard');
        })}
      >
        <Stack spacing={2}>
          <Controller
            control={control}
            name="account"
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <InputLabel>帳號</InputLabel>
                <OutlinedInput label="帳號" type="text" {...field} />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <InputLabel>密碼</InputLabel>
                <OutlinedInput
                  endAdornment={
                    showPassword ? (
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
                    )
                  }
                  label="密碼"
                  type={showPassword ? 'text' : 'password'}
                  {...field}
                />
                {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              忘記密碼
            </Link>
          </div>

          <Button disabled={isSubmitting} type="submit" variant="contained">
            登入
          </Button>
        </Stack>
      </form>
      <Alert severity="warning">
        Use{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          admin
        </Typography>{' '}
        with password{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          as123456
        </Typography>
      </Alert>
    </Stack>
  );
}
