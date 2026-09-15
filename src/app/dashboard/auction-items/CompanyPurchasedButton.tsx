'use client';

import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { useRunApiMutation } from '@/domain/data/useRunApiMutation';
import { CompanyPurchased } from '@/server-action/backend/auction-items/CompanyPurchased';
import { Button } from '@mui/material';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

export default function CompanyPurchasedButton({ auctionItem }: { auctionItem: AuctionItem }) {
  const runApiMutation = useRunApiMutation();
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
          const res = await runApiMutation(
            [
              ['auction-items'],
              ['items'],
              ['shippings'],
              ['records'],
              ['/reports/records'],
              ['/reports/records/summary'],
              ['reports'],
              ['wallets'],
              ['bonus'],
            ],
            () => CompanyPurchased(auctionItem.auctionId)
          );
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
