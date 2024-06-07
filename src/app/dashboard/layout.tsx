import * as React from 'react';
import { getToken } from '@/api/getToken';
import { type JwtPayload } from '@/api/JwtPayload';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { jwtDecode } from 'jwt-decode';

import { UserContext } from '@/contexts/UserContext';
import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const { token } = await getToken();
  const jwt = token ? jwtDecode<JwtPayload>(token) : null;

  return (
    <>
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
        <SideNav />
        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
          <MainNav />
          <main>
            <Container maxWidth="xl" sx={{ py: '24px' }}>
              <UserContext
                user={
                  jwt
                    ? {
                        id: jwt.id,
                        account: jwt.account,
                        permissions: jwt.permissions,
                      }
                    : null
                }
              >
                {children}
              </UserContext>
            </Container>
          </main>
        </Box>
      </Box>
    </>
  );
}
