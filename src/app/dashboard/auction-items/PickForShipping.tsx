'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GetAuctionItemQueryOptions } from '@/api/backend/auction-items/GetAuctionItem.query';
import { ShippingAuctionItem } from '@/api/backend/auction-items/ShippingAuctionItem';
import { SHIPPING_TYPE } from '@/api/backend/static-configs.data';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Drawer, FormControl, FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { pickedItemIdsReducerAtom, PickingList } from './PickingList';

export function PickForShippingButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const picking = searchParams.get('picking');
  const stage = searchParams.get('stage');
  const [pickedItemIds, dispatch] = useAtom(pickedItemIdsReducerAtom);

  return (
    <Stack direction="row" spacing={1}>
      {!stage && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('picking', 'shipping');
            newSearchParams.set('stage', 'picking');
            router.replace(`?${newSearchParams}`);
          }}
        >
          選取出貨
        </Button>
      )}
      {picking === 'shipping' && stage === 'picking' && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="error"
          onClick={() => {
            dispatch({ type: 'clear' });
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('picking');
            newSearchParams.delete('stage');
            router.replace(`?${newSearchParams}`);
          }}
        >
          取消選取
        </Button>
      )}
      {picking === 'shipping' && stage === 'picking' && pickedItemIds.length > 0 && (
        <Button
          type="button"
          size="small"
          variant="contained"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('stage', 'checking');
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
  const picking = searchParams.get('picking');
  const stage = searchParams.get('stage');

  return (
    <Drawer
      PaperProps={{ sx: { width: 360 } }}
      anchor="right"
      open={picking === 'shipping' && stage === 'checking'}
      onClose={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('stage', 'picking');
        router.replace(`?${newSearchParams}`);
      }}
    >
      <Stack sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
        <PickingList />
        <ShippingForm />
      </Stack>
    </Drawer>
  );
}

const Schema = z.object({
  address: z.string().min(1, { message: '必填' }),
  recipientName: z.string().min(1, { message: '必填' }),
  phone: z.string().min(1, { message: '必填' }),
});
function ShippingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItemIds = useAtomValue(pickedItemIdsReducerAtom);
  const auctionItemQueries = useQueries({
    queries: pickedItemIds.map(GetAuctionItemQueryOptions),
    combine: (queries) => {
      if (queries.some((q) => q.isPending)) {
        return { isPending: true } as const;
      }
      if (queries.some((q) => q.isError) || queries.some((q) => q.data?.error)) {
        return { isError: true } as const;
      }
      return {
        length: queries.length,
        sum: queries.reduce((acc, item) => acc + item.data!.data!.closedPrice, 0).toLocaleString(),
      } as const;
    },
  });

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

  if (auctionItemQueries.isPending || auctionItemQueries.isError) return;

  return (
    <Stack
      component="form"
      p={2}
      spacing={2}
      onSubmit={handleSubmit(async (data) => {
        const res = await ShippingAuctionItem({
          ...data,
          type: SHIPPING_TYPE.enum('AddressType'),
          auctionItemIDs: pickedItemIds,
        });

        if (res.error) {
          enqueueSnackbar(res.error, { variant: 'error' });
          return;
        }

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('picking');
        newSearchParams.delete('stage');
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
          共 {auctionItemQueries.length} 筆, 總計 ¥ {auctionItemQueries.sum}
        </Typography>

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          出貨
        </Button>
      </Stack>
    </Stack>
  );
}
