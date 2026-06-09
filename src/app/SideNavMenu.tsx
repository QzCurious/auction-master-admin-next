'use client';

import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { ArrowSquareUpRight as ArrowSquareUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareUpRight';

import { Logo } from '@/components/core/logo';
import { navItems } from '@/components/dashboard/layout/config';
import { NavItem } from '@/components/dashboard/layout/NavItem';

export default function SideNavMenu() {
  return (
    <>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href="/dashboard" sx={{ display: 'inline-flex' }}>
          <Logo color="light" height={32} width={122} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {navItems.map(({ key, ...item }) => (
            <NavItem key={key} {...item} />
          ))}
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Stack spacing={2} sx={{ p: '12px' }}>
        {process.env.NODE_ENV === 'development' && (
          <Button
            component="a"
            endIcon={<ArrowSquareUpRightIcon fontSize="var(--icon-fontSize-md)" />}
            fullWidth
            href="https://material-kit-pro-react.devias.io/dashboard"
            sx={{ mt: 2 }}
            target="_blank"
            variant="contained"
          >
            Preview Pro version
          </Button>
        )}
      </Stack>
    </>
  );
}
