import * as React from 'react';
import { GetAdminPermissions } from '@/api/backend/rbac/GetAdminPermissions';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { getJwt } from '@/domain/auth/getJwt';
import { UserContextProvider } from '@/domain/auth/UserContext';
import { PermissionsContextProvider } from '@/domain/permission/PermissionsContext';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { MainNav } from '@/components/dashboard/layout/main-nav';

import SideNavMenu from '../SideNavMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const jwt = await getJwt();
  if (!jwt) {
    return <RedirectAuthError />;
  }
  const permissionsRes = await GetAdminPermissions(jwt.account);

  return (
    <UserContextProvider user={jwt}>
      <PermissionsContextProvider permissions={permissionsRes.data ?? {}}>
        <GlobalStyles
          styles={{
            body: {
              '--MainNav-height': '56px',
              '--MainNav-zIndex': 1000,
              '--SideNav-width': '280px',
              '--SideNav-zIndex': 1100,
              '--MobileNav-width': '320px',
              '--MobileNav-zIndex': 1100,
            },
          }}
        />
        <Box
          sx={{
            bgcolor: 'var(--mui-palette-background-default)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: '100%',
          }}
        >
          <Box
            sx={{
              '--SideNav-background': 'var(--mui-palette-neutral-950)',
              '--SideNav-color': 'var(--mui-palette-common-white)',
              '--NavItem-color': 'var(--mui-palette-neutral-300)',
              '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
              '--NavItem-active-background': 'var(--mui-palette-primary-main)',
              '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
              '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
              '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
              '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
              '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
              bgcolor: 'var(--SideNav-background)',
              color: 'var(--SideNav-color)',
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              height: '100%',
              left: 0,
              maxWidth: '100%',
              position: 'fixed',
              scrollbarWidth: 'none',
              top: 0,
              width: 'var(--SideNav-width)',
              zIndex: 'var(--SideNav-zIndex)',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <SideNavMenu />
          </Box>

          <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
            <MainNav />

            <main>
              <Container maxWidth="xl" sx={{ py: '24px' }}>
                {permissionsRes.data ? children : <WithoutPermissionsError permissions={['GetAdminPermissions']} />}
              </Container>
            </main>
          </Box>
        </Box>
      </PermissionsContextProvider>
    </UserContextProvider>
  );
}
