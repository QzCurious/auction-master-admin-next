'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GetAuctionItem, type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { AUCTION_ITEM_STATUS_MAP } from '@/api/backend/configs.data';
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { atom, useAtomValue } from 'jotai';

import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

export const pickedItemIdsAtom = atom<Array<AuctionItem['id']>>([]);

export function PickForShippingButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItems = useAtomValue(pickedItemIdsAtom);

  return (
    <Stack direction="row" spacing={1}>
      {searchParams.get('pick-for-shipping') !== 'picking' ? (
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pick-for-shipping', 'picking');
            newSearchParams.set('status', AUCTION_ITEM_STATUS_MAP.ClosedStatus.toString());
            router.replace(`?${newSearchParams}`);
          }}
        >
          選取出貨
        </Button>
      ) : (
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="error"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('pick-for-shipping');
            newSearchParams.delete('status');
            router.replace(`?${newSearchParams}`);
          }}
        >
          取消選取
        </Button>
      )}
      {searchParams.get('pick-for-shipping') === 'picking' && pickedItems.length > 0 && (
        <Button
          type="button"
          size="small"
          variant="contained"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pick-for-shipping', 'checking');
            router.replace(`?${newSearchParams}`);
          }}
        >
          安排出貨
        </Button>
      )}
    </Stack>
  );
}

export function PickForShipping() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItemIds = useAtomValue(pickedItemIdsAtom);

  return (
    <Drawer
      anchor="right"
      open={searchParams.get('pick-for-shipping') === 'checking' && pickedItemIds.length > 0}
      onClose={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('pick-for-shipping', 'picking');
        router.replace(`?${newSearchParams}`);
      }}
    >
      <PickingList />
    </Drawer>
  );
}

function PickingList() {
  const pickedItems = useAtomValue(pickedItemIdsAtom);
  const auctionItemQueries = useQueries({
    queries: pickedItems.map((id) => ({
      queryKey: ['auction-items', id],
      queryFn: () => GetAuctionItem(id),
    })),
  });

  const error = auctionItemQueries.map((q) => q.data?.error);
  if (error.some((err) => err === '1001')) {
    return <WithoutPermissionsError permissions={['GetAuctionItem']} />;
  }
  if (error.some((err) => err === '1003')) {
    return <RedirectAuthError />;
  }

  const queries = auctionItemQueries.filter((q) => !q.isError);

  return (
    <Stack sx={{ width: '100%', maxWidth: 360, height: '100%', bgcolor: 'background.paper' }}>
      <List sx={{ flex: 1 }}>
        {queries.map((item, i) => (
          <React.Fragment key={pickedItems[i]}>
            {item.isPending ? <ListItemSkeleton /> : !!item.data.data && <PickedListItem item={item.data.data} />}
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>

      <Stack p={2} direction="row" justifyContent="space-between">
        <span>
          共 {queries.length} 筆, 總計 ¥{' '}
          {queries.some((r) => r.isPending) ? (
            <Skeleton animation="wave" height={10} />
          ) : (
            queries.map((q) => q.data!.data!).reduce((acc, item) => acc + item.closedPrice, 0)
          )}
        </span>

        <Button type="button" size="small" variant="contained">
          出貨
        </Button>
      </Stack>
    </Stack>
  );
}

function ListItemSkeleton() {
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Skeleton variant="circular" animation="wave" width={40} height={40} />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={<Skeleton animation="wave" height={10} />}
        secondary={
          <ul>
            <li>
              <Skeleton animation="wave" height={10} />
            </li>
            <li>
              <Skeleton animation="wave" height={10} />
            </li>
          </ul>
        }
      />
    </ListItem>
  );
}

function PickedListItem({ item }: { item: AuctionItem }) {
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={item.name} src={item.photo} />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={item.name}
        secondary={
          <ul>
            <li>
              <Typography color="GrayText" component="span">
                日拍 ID:
              </Typography>{' '}
              <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                {item.auctionID}
              </Typography>
            </li>
            <li>
              <Typography color="GrayText" component="span">
                結標金額:
              </Typography>{' '}
              <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                ¥ {item.closedPrice}
              </Typography>
            </li>
          </ul>
        }
      />
    </ListItem>
  );
}
