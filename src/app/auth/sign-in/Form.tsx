'use client';

import { useState } from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { ReqSchema } from '@/api/session';
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
import { type z } from 'zod';

import { paths } from '@/paths';

import { login } from './actions';

export function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<z.input<typeof ReqSchema>>({
    defaultValues: {
      account: '',
      password: '',
    },
    resolver: zodResolver(ReqSchema),
  });
  const router = useRouter();

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
      </Stack>
      {errors.root && <Alert color="error">{errors.root.message}</Alert>}
      <form
        onSubmit={handleSubmit(async (data) => {
          const formData = new FormData();
          formData.append('account', data.account);
          formData.append('password', data.password);
          const res = await login(formData);
          if (res.error === '1004' || res.error === '1502') {
            setError('root', { message: 'Account or password is incorrect' });
            return;
          }
          if (res.error === '1001') {
            setError('root', { message: 'Permission denied' });
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
                <InputLabel>Account</InputLabel>
                <OutlinedInput label="Account" type="text" {...field} />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <InputLabel>Password</InputLabel>
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
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...field}
                />
                {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>

          <Button disabled={isSubmitting} type="submit" variant="contained">
            Sign in
          </Button>
        </Stack>
      </form>
      <Alert color="warning">
        Use{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          admin
        </Typography>{' '}
        with password{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          1234
        </Typography>
      </Alert>
    </Stack>
  );
}
