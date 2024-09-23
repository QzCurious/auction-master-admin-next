import { useTransition } from 'react';
import { CancelAuctionItem } from '@/api/backend/auction-items/CancelAuctionItem';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { Button } from '@mui/material';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

/**
 * @deprecated marked as unused
 */
export default function CancelAuctionItemButton({ auctionItemId }: { auctionItemId: AuctionItem['id'] }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const [isPending, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Button
        type="button"
        size="small"
        color="primary"
        variant="outlined"
        sx={{ whiteSpace: 'nowrap' }}
        disabled={isPending}
        {...bindTrigger(popupState)}
      >
        下架商品
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="將商品標示為下架"
        onConfirm={() => {
          startTransition(async () => {
            const res = await CancelAuctionItem({ id: auctionItemId });

            if (res.error) {
              enqueueSnackbar(res.error, { variant: 'error' });
              return;
            }
            enqueueSnackbar('已將商品標示為下架', { variant: 'success' });
          });
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
