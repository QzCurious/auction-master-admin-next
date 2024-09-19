import * as React from 'react';
import { GetAdminPermissions } from '@/api/backend/rbac/GetAdminPermissions';
import { getUser } from '@/api/getToken';
import { PermissionsContextProvider } from '@/domain/permission/PermissionsContext';
import { UserContextProvider } from '@/domain/user/UserContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { MainNav } from '@/components/dashboard/layout/main-nav';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import SideNavMenu from '../SideNavMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const user = await getUser();
  if (!user) {
    return <RedirectAuthError />;
  }
  const permissionsRes = await GetAdminPermissions(user.account);
  if (permissionsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdminPermissions']} />;
  }
  if (permissionsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <UserContextProvider user={user}>
      <PermissionsContextProvider permissions={permissionsRes.data}>
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
                {children}
              </Container>
            </main>
          </Box>
        </Box>
      </PermissionsContextProvider>
    </UserContextProvider>
  );
}
