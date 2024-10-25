'use client';

import { useState } from 'react';
import { AdminLogin } from '@/api/AdminLogin';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const Schema = z.object({
  account: z.string().min(1, { message: '必填' }),
  password: z.string().min(1, { message: '必填' }),
});

export function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<z.input<typeof Schema>>({
    defaultValues: {
      account: '',
      password: '',
    },
    resolver: zodResolver(Schema),
  });
  const handleApiError = useHandleApiError();

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">登入</Typography>
      </Stack>
      {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
      <form
        onSubmit={handleSubmit(async (data) => {
          const res = await AdminLogin(data);
          if (res) {
            handleApiError(res.error);
            return;
          }

          const goto = new URLSearchParams(location.search).get('goto');
          location.href = goto ?? '/dashboard';
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

          {/* <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              忘記密碼
            </Link>
          </div> */}

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
