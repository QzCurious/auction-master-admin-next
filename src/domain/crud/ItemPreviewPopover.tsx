'use client';

import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Link, Paper, Popover, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Box } from '@mui/system';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import PopupState from 'material-ui-popup-state';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';

export default function ItemPreviewPopover({ item }: { item: Item }) {
  return (
    <PopupState key={item.id} variant="popper">
      {(popupState) => (
        <>
          <IconButton {...bindTrigger(popupState)} size="small" color="primary" sx={{ p: 0.5 }}>
            <StackSimple />
          </IconButton>
          <Popover {...bindPopover(popupState)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Paper sx={{ p: 1, position: 'relative', maxWidth: '300px', border: '1px solid #eee' }} elevation={8}>
              <HavePermissionsOnly permissions={['GetItemAndDetails']}>
                <Box
                  sx={{
                    position: 'absolute',
                    borderRadius: 1,
                    top: 0,
                    right: 0,
                    bgcolor: 'white',
                  }}
                >
                  <IconButton
                    LinkComponent={Link}
                    color="primary"
                    href={`/dashboard/items/edit/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LaunchOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </HavePermissionsOnly>
              <a href={item.photos?.[0]?.photo} target="_blank" rel="noreferrer">
                <img src={item.photos?.[0]?.photo} style={{ display: 'block', maxWidth: '100%' }} alt="" />
              </a>
              <Typography variant="body2" mt={0.5}>
                {item.name}
              </Typography>
            </Paper>
          </Popover>
        </>
      )}
    </PopupState>
  );
}
