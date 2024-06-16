'use client';

import { SnackbarProvider } from 'notistack';
import * as React from 'react';

import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
