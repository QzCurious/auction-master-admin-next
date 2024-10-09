'use client';

import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Link, Paper, Popover, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Box } from '@mui/system';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import PopupState from 'material-ui-popup-state';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';

export default function AuctionItemPreviewPopover({ auctionItem }: { auctionItem: AuctionItem }) {
  return (
    <PopupState key={auctionItem.auctionId} variant="popper">
      {(popupState) => (
        <>
          <IconButton {...bindTrigger(popupState)} size="small" color="primary">
            <Gavel />
          </IconButton>

          <Popover {...bindPopover(popupState)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Paper
              sx={{
                p: 1,
                position: 'relative',
                maxWidth: '300px',
                border: '1px solid #eee',
              }}
              elevation={8}
            >
              <Box
                sx={{
                  position: 'absolute',
                  borderRadius: 1,
                  top: 0,
                  right: 0,
                  py: 0.5,
                  px: 1,
                  bgcolor: 'white',
                }}
              >
                <HavePermissionsOnly permissions={['GetAuctionItem']}>
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
                      href={`/dashboard/auction-items/edit/${auctionItem.auctionId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <LaunchOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </HavePermissionsOnly>
              </Box>
              <a href={auctionItem.photo} target="_blank" rel="noreferrer">
                <img src={auctionItem.photo} style={{ display: 'block', maxWidth: '100%' }} alt="" />
              </a>
              <Typography variant="body2" mt={0.5}>
                {auctionItem.name}
              </Typography>
            </Paper>
          </Popover>
        </>
      )}
    </PopupState>
  );
}
