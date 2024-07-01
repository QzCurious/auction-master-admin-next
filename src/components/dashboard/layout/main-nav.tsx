'use client';

import * as React from 'react';
import SideNavMenu from '@/app/SideNavMenu';
import { Drawer } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';

import { usePopover } from '@/hooks/use-popover';

import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

            <Drawer
              PaperProps={{
                sx: {
                  '--MobileNav-background': 'var(--mui-palette-neutral-950)',
                  '--MobileNav-color': 'var(--mui-palette-common-white)',
                  '--NavItem-color': 'var(--mui-palette-neutral-300)',
                  '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
                  '--NavItem-active-background': 'var(--mui-palette-primary-main)',
                  '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
                  '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
                  '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
                  '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
                  '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
                  bgcolor: 'var(--MobileNav-background)',
                  color: 'var(--MobileNav-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '100%',
                  scrollbarWidth: 'none',
                  width: 'var(--MobileNav-width)',
                  zIndex: 'var(--MobileNav-zIndex)',
                  '&::-webkit-scrollbar': { display: 'none' },
                },
              }}
              onClose={() => {
                setOpenNav(false);
              }}
              open={openNav}
            >
              <SideNavMenu />
            </Drawer>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            {/* <Tooltip title="Contacts">
              <IconButton>
                <UsersIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip> */}
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src="/assets/avatar.png"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
    </React.Fragment>
  );
}
