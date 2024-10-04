'use client';

import * as React from 'react';
import { useContext, useState } from 'react';
import RouterLink from 'next/link';
import SideNavMenu from '@/app/SideNavMenu';
import { logout } from '@/domain/auth/logout';
import refreshTokenAction from '@/domain/auth/refreshTokenAction';
import { UserContext } from '@/domain/auth/UserContext';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { PERMISSION_MAP } from '@/domain/permission/permissions.data';
import { PermissionsContext } from '@/domain/permission/PermissionsContext';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { Button, Drawer } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import copy from 'copy-to-clipboard';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

export function MainNav() {
  const user = useContext(UserContext);
  const [openNav, setOpenNav] = useState(false);
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

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
              onClick={() => {
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
            {process.env.NODE_ENV === 'development' && <LogPermissionsButton />}
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
            <Avatar src="/assets/avatar.png" sx={{ cursor: 'pointer' }} {...bindTrigger(popupState)} />
          </Stack>
        </Stack>
      </Box>

      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { width: '240px' } } }}
      >
        <Box sx={{ p: '16px 20px ' }}>
          <Typography variant="subtitle1">{user?.account}</Typography>
          {/* <Typography color="text.secondary" variant="body2"></Typography> */}
        </Box>
        <Divider />
        <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
          <HavePermissionsOnly permissions={['UpdateAdminPassword']}>
            <MenuItem component={RouterLink} href="/dashboard/settings" onClick={() => popupState.open()}>
              <ListItemIcon>
                <GearSixIcon fontSize="var(--icon-fontSize-md)" />
              </ListItemIcon>
              設定
            </MenuItem>
          </HavePermissionsOnly>
          {/* <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Profile
        </MenuItem> */}
          {process.env.NODE_ENV === 'development' && (
            <MenuItem
              onClick={async () => {
                const error = await refreshTokenAction();
                if (error) {
                  enqueueSnackbar(error, { variant: 'error' });
                  return;
                }
                enqueueSnackbar('Token refreshed', { variant: 'success' });
              }}
            >
              <ListItemIcon>
                <SignOutIcon fontSize="var(--icon-fontSize-md)" />
              </ListItemIcon>
              刷新 Token
            </MenuItem>
          )}

          <MenuItem onClick={() => logout()}>
            <ListItemIcon>
              <SignOutIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            登出
          </MenuItem>
        </MenuList>
      </Popover>
    </React.Fragment>
  );
}

function LogPermissionsButton() {
  const permissions = useContext(PermissionsContext);
  const havePermissions = useHavePermissions();

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {!havePermissions(['GetAdminPermissions']) && (
        <Typography component="p" color="gray">
          至少勾一下
          <Typography
            color="primary"
            component="span"
            sx={{ cursor: 'pointer' }}
            onClick={() => copy(PERMISSION_MAP.GetAdminPermissions.description)}
          >
            {PERMISSION_MAP.GetAdminPermissions.description}
          </Typography>
          吧
        </Typography>
      )}
      <Button type="button" variant="outlined" size="small" onClick={() => console.log(permissions)}>
        Log Permissions
      </Button>
    </Stack>
  );
}
