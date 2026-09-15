'use client';

import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { useRunApiMutation } from '@/domain/data/useRunApiMutation';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import { ToggleActivateAuctionItem } from '@/server-action/backend/auction-items/ToggleActivateAuctionItem';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function StopWatchButton({ auctionItem }: { auctionItem: AuctionItem }) {
  const runApiMutation = useRunApiMutation();
  const { enqueueSnackbar } = useSnackbar();
  const handleApiError = useHandleApiError();

  if (auctionItem.status === AUCTION_ITEM_STATUS.enum('StopBiddingStatus')) {
    return (
      <Button
        type="button"
        color="primary"
        size="small"
        variant="outlined"
        onClick={async () => {
          const res = await runApiMutation([['items'], ['auction-items']], () =>
            ToggleActivateAuctionItem(auctionItem.auctionId, AUCTION_ITEM_STATUS.enum('InitStatus'))
          );
          if (res.error) {
            handleApiError(res.error);
            return;
          }
          enqueueSnackbar('已啟用盯標', { variant: 'success' });
        }}
      >
        啟用盯標
      </Button>
    );
  }

  return (
    <Button
      type="button"
      color="error"
      size="small"
      variant="outlined"
      onClick={async () => {
        const res = await runApiMutation([['items'], ['auction-items']], () =>
          ToggleActivateAuctionItem(auctionItem.auctionId, AUCTION_ITEM_STATUS.enum('StopBiddingStatus'))
        );
        if (res.error) {
          handleApiError(res.error);
          return;
        }
        enqueueSnackbar('已停止盯標', { variant: 'success' });
      }}
    >
      停止盯標
    </Button>
  );
}
