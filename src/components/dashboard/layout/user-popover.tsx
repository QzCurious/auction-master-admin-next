'use client';

import { useContext } from 'react';
import RouterLink from 'next/link';
import { logout } from '@/api/logout';
import refreshTokenAction from '@/api/refreshTokenAction';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { useSnackbar } from 'notistack';

import { paths } from '@/paths';
import { UserContext } from '@/contexts/UserContext';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useContext(UserContext);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{user?.account}</Typography>
        <Typography color="text.secondary" variant="body2">
          fake@email.com
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          設定
        </MenuItem>
        {/* <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Profile
        </MenuItem> */}
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
        <MenuItem onClick={() => logout()}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          登出
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
