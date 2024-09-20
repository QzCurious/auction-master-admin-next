'use client';

import React from 'react';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { GetAuctionItemQueryOptions } from '@/api/backend/auction-items/GetAuctionItem.query';
import { currencySign } from '@/domain/static/static';
import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Typography } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { atom, useAtomValue } from 'jotai';
import { atomWithReducer } from 'jotai/utils';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

export const pickingTypeAtom = atom<'shipping' | 'fee' | null>(null);
export const pickedItemIdsReducerAtom = atomWithReducer(
  [],
  (prev: Array<AuctionItem['id']>, action: { type: 'toggle'; id: AuctionItem['id'] } | { type: 'clear' }) => {
    switch (action.type) {
      case 'toggle':
        return prev.includes(action.id) ? prev.filter((id) => id !== action.id) : [...prev, action.id];
      case 'clear':
        return [];
    }
  }
);

export function PickingList() {
  const pickedItemIds = useAtomValue(pickedItemIdsReducerAtom);
  const auctionItemQueries = useQueries({
    queries: pickedItemIds.map(GetAuctionItemQueryOptions),
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
    <List sx={{ flex: 1, overflow: 'auto' }}>
      {queries.map((item, i) => (
        <React.Fragment key={pickedItemIds[i]}>
          {item.isPending ? <ListItemSkeleton /> : !!item.data.data && <PickedListItem item={item.data.data} />}
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
}

export function ListItemSkeleton() {
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

export function PickedListItem({ item }: { item: AuctionItem }) {
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
              <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                {item.auctionID}
              </Typography>
            </li>
            <li>
              <Typography color="GrayText" component="span">
                結標金額:
              </Typography>{' '}
              <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                {currencySign('JPY')}
                {item.closedPrice.toLocaleString()}
              </Typography>
            </li>
          </ul>
        }
      />
    </ListItem>
  );
}
