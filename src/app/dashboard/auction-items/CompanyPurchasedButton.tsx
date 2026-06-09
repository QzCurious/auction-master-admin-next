'use client';

import { CompanyPurchased } from '@/api/backend/auction-items/CompanyPurchased';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { Button } from '@mui/material';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

export default function CompanyPurchasedButton({ auctionItem }: { auctionItem: AuctionItem }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleApiError = useHandleApiError();

  return (
    <>
      <Button size="small" variant="contained" color="primary" {...bindTrigger(popupState)}>
        公司買回
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="確認公司買回"
        onConfirm={async () => {
          const res = await CompanyPurchased(auctionItem.auctionId);
          if (res.error) {
            handleApiError(res.error);
            return;
          }
          enqueueSnackbar(`已標記為公司買回`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
