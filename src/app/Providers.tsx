'use client';

import * as React from 'react';
import { SnackbarProvider } from 'notistack';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      <UserProvider>
        <ThemeProvider>
          <SnackbarProvider>{children}</SnackbarProvider>
        </ThemeProvider>
      </UserProvider>
    </LocalizationProvider>
  );
}
