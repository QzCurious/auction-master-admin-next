'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GetAuctionItem, type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { ShippingAuctionItem } from '@/api/backend/auction-items/ShippingAuctionItem';
import { SHIPPING_TYPE } from '@/api/backend/static-configs.data';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

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
      PaperProps={{ sx: { width: 360 } }}
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
    <Stack sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {queries.map((item, i) => (
          <React.Fragment key={pickedItems[i]}>
            {item.isPending ? <ListItemSkeleton /> : !!item.data.data && <PickedListItem item={item.data.data} />}
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>

      {queries.every((r) => !r.isPending) && <ShippingForm auctionItems={queries.map((q) => q.data.data!)} />}
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
              <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                {item.auctionID}
              </Typography>
            </li>
            <li>
              <Typography color="GrayText" component="span">
                結標金額:
              </Typography>{' '}
              <Typography sx={{ display: 'inline' }} component="span" color="text.primary">
                ¥ {item.closedPrice.toLocaleString()}
              </Typography>
            </li>
          </ul>
        }
      />
    </ListItem>
  );
}

const Schema = z.object({
  address: z.string().min(1, { message: '必填' }),
  recipientName: z.string().min(1, { message: '必填' }),
  phone: z.string().min(1, { message: '必填' }),
});
function ShippingForm({ auctionItems }: { auctionItems: Array<AuctionItem> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPickedItems = useSetAtom(pickedItemIdsAtom);
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.output<typeof Schema>>({
    defaultValues: {
      address: '',
      recipientName: '',
      phone: '',
    },
    resolver: zodResolver(Schema),
  });

  return (
    <Stack
      component="form"
      p={2}
      spacing={2}
      onSubmit={handleSubmit(async (data) => {
        const res = await ShippingAuctionItem({
          ...data,
          type: SHIPPING_TYPE.enum('AddressType'),
          auctionItemIDs: auctionItems.map((item) => item.id),
        });

        if (res.error) {
          enqueueSnackbar(res.error, { variant: 'error' });
          return;
        }

        const newSearchParams = new URLSearchParams(searchParams);
        setPickedItems([]);
        newSearchParams.delete('pick-for-shipping');
        router.replace(`?${newSearchParams}`);
        enqueueSnackbar('已出貨', { variant: 'success' });
      })}
    >
      <Stack spacing={3} mt={2}>
        <Controller
          control={control}
          name="address"
          render={({ field, fieldState }) => (
            <FormControl fullWidth error={!!fieldState.error}>
              <TextField {...field} label="收貨地址" fullWidth />
              {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="recipientName"
          render={({ field, fieldState }) => (
            <FormControl fullWidth error={!!fieldState.error}>
              <TextField {...field} label="收貨人姓名" fullWidth />
              {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormControl fullWidth error={!!fieldState.error}>
              <TextField {...field} label="收貨人電話" fullWidth />
              {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
            </FormControl>
          )}
        />
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body1">
          共 {auctionItems.length} 筆, 總計 ¥{' '}
          {auctionItems.reduce((acc, item) => acc + item.closedPrice, 0).toLocaleString()}
        </Typography>

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          出貨
        </Button>
      </Stack>
    </Stack>
  );
}
