'use client';

import * as React from 'react';
import { signInDestination } from '@/domain/auth/navigation';
import { createQueryClient } from '@/domain/data/queryClient';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { zhTW } from 'date-fns/locale/zh-TW';
import { closeSnackbar, enqueueSnackbar, SnackbarProvider } from 'notistack';

import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() =>
    createQueryClient((error) => {
      if (error.type === 'redirect') {
        window.location.assign(
          error.url === '/auth/sign-in' ? signInDestination(location.pathname + location.search) : error.url
        );
      } else {
        enqueueSnackbar(error.message, { variant: 'error', preventDuplicate: true });
      }
    })
  );

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={zhTW}
      dateFormats={{
        normalDate: 'yyyy/MM/dd',
      }}
    >
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider
            // eslint-disable-next-line react/no-unstable-nested-components
            action={(snackbarId) => (
              <IconButton onClick={() => closeSnackbar(snackbarId)} color="inherit">
                <CloseIcon />
              </IconButton>
            )}
          >
            {children}
          </SnackbarProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
