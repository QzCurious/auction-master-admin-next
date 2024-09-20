'use client';

import React from 'react';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { GetBackendConfigsQueryOptions } from '@/api/backend/GetConfigs.query';
import { GetItemAndDetailQueryOptions } from '@/api/backend/items/GetItemAndDetail.query';
import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { currencySign, DATE_FORMAT } from '@/domain/static/static';
import { Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Typography } from '@mui/material';
import { useQueries, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
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
  const itemQueries = useQueries({
    queries: pickedItemIds.map(GetItemAndDetailQueryOptions),
  });

  const error = itemQueries.map((q) => q.data?.error);
  if (error.some((err) => err === '1001')) {
    return <WithoutPermissionsError permissions={['GetItemAndDetails']} />;
  }
  if (error.some((err) => err === '1003')) {
    return <RedirectAuthError />;
  }

  const queries = itemQueries.filter((q) => !q.isError);

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

export function PickedListItem({ item }: { item: Item }) {
  const configsRes = useQuery(GetBackendConfigsQueryOptions());
  if (configsRes.error) return null;
  if (configsRes.isPending) return null;
  if (configsRes.data?.error === '1001') return <WithoutPermissionsError permissions={['GetConfigs']} />;
  if (configsRes.data?.error === '1003') return <RedirectAuthError />;

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={item.name} src={item.photos?.[0]?.photo} />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={item.name}
        secondary={
          <ul>
            <li>
              <Typography color="GrayText" component="span">
                留倉費:
              </Typography>{' '}
              <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                {currencySign('TWD')}
                {item.expireAt ? item.space * configsRes.data.data.costPerSpace : 0}
              </Typography>
            </li>
            <li>
              <Typography color="GrayText" component="span">
                實際重量:
              </Typography>{' '}
              <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                {item.grossWeight}g
              </Typography>
            </li>

            {!!item.expireAt && (
              <li>
                <Typography color="GrayText" component="span">
                  過期時間:
                </Typography>{' '}
                <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                  {format(item.expireAt, DATE_FORMAT)}
                </Typography>
              </li>
            )}
          </ul>
        }
      />
    </ListItem>
  );
}
