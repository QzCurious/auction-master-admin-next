'use client';

import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { zhTW } from 'date-fns/locale/zh-TW';
import { closeSnackbar, SnackbarProvider } from 'notistack';

import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 10 * 1000,
          },
        },
      })
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
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
