'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GetAuctionItemQueryOptions } from '@/api/backend/auction-items/GetAuctionItem.query';
import { ShippingAuctionItem } from '@/api/backend/auction-items/ShippingAuctionItem';
import { GetConfigsQueryOptions } from '@/api/GetConfigs.query';
import { HandleApiError, useHandleApiError } from '@/domain/api/HandleApiError';
import { currencySign } from '@/domain/static/static';
import { SHIPMENT_TYPE } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  List,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { EnvelopeSimple, Package } from '@phosphor-icons/react/dist/ssr';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { ListItemSkeleton, pickedItemIdsReducerAtom, PickedListItem } from './PickingList';
import { type SearchParamsSchema } from './SearchParamsSchema';

export function PickForShippingButtons({
  picking,
  stage,
}: Pick<z.output<typeof SearchParamsSchema>, 'picking' | 'stage'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

export function PickForShipping({ picking, stage }: Pick<z.output<typeof SearchParamsSchema>, 'picking' | 'stage'>) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      <ShippingForm />
    </Drawer>
  );
}

const Schema = z.object({
  // shippingCostsWithinJapan: z.number({ message: '必填' }).min(0).array(),
  address: z.string().min(1, { message: '必填' }),
  recipientName: z.string().min(1, { message: '必填' }),
  phone: z.string().min(1, { message: '必填' }),
  remark: z.string(),
});
function ShippingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItemIds = useAtomValue(pickedItemIdsReducerAtom);
  const auctionItemQueries = useQueries({
    queries: pickedItemIds.map(GetAuctionItemQueryOptions),
  });
  const configsQuery = useQuery(GetConfigsQueryOptions());

  const handleApiError = useHandleApiError();
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
      remark: '',
      // shippingCostsWithinJapan: [],
    },
    resolver: zodResolver(Schema),
  });

  const auctionItemQueryError = auctionItemQueries.find((q) => q.data?.error);
  if (auctionItemQueryError?.data?.error) {
    return <HandleApiError error={auctionItemQueryError.data.error} />;
  }
  if (configsQuery.data?.error) {
    return <HandleApiError error={configsQuery.data.error} />;
  }

  const queries = auctionItemQueries.filter((q) => !q.isError);
  // const shippingCostsWithinJapan = watch('shippingCostsWithinJapan');

  return (
    <Stack
      component="form"
      sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}
      onSubmit={handleSubmit(async (data) => {
        const res = await ShippingAuctionItem({
          ...data,
          shipmentType: SHIPMENT_TYPE.enum('AddressShipmentType'),
          auctionIds: pickedItemIds,
          // shippingCostsWithinJapan: R.sum(data.shippingCostsWithinJapan),
        });

        if (res.error) {
          handleApiError(res.error);
          return;
        }

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('picking');
        newSearchParams.delete('stage');
        router.replace(`?${newSearchParams}`);
        enqueueSnackbar('已出貨', { variant: 'success' });
      })}
    >
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {queries.map((item, i) => (
          <React.Fragment key={pickedItemIds[i]}>
            {item.isPending ? <ListItemSkeleton /> : <PickedListItem item={item.data.data!} />}
            {/* <Controller
              control={control}
              name={`shippingCostsWithinJapan.${i}`}
              render={({ field, fieldState }) => (
                <FormControl sx={{ px: 2 }} fullWidth error={!!fieldState.error}>
                  <TextField
                    {...field}
                    size="small"
                    label="日本國內運費"
                    fullWidth
                    type="number"
                    onChange={(e) => {
                      field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                    }}
                    inputProps={{ min: 0 }}
                  />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            /> */}
            <Divider variant="middle" component="li" sx={{ mt: 2 }} />
          </React.Fragment>
        ))}
      </List>
      <Stack p={2} spacing={2}>
        <Stack spacing={2} mt={2}>
          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField {...field} size="small" label="收貨地址" fullWidth />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="recipientName"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField {...field} size="small" label="收貨人姓名" fullWidth />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField {...field} size="small" label="收貨人電話" fullWidth />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="remark"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField {...field} size="small" label="備註" fullWidth multiline minRows={2} maxRows={6} />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body1">
            共 {auctionItemQueries.length} 筆
            {(() => {
              if (auctionItemQueries.some((q) => q.isPending) || configsQuery.isPending) {
                return (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span>, 總值 {currencySign('JPY')}</span>
                    <Skeleton variant="text" sx={{ width: 80, ml: 0.5 }} />
                  </Box>
                );
              }

              const sum = R.sum(auctionItemQueries.map((q) => q.data?.data?.closedPrice ?? 0));

              return (
                <span>
                  , 總值 {currencySign('JPY')}
                  {sum.toLocaleString()}
                  {configsQuery.data && (
                    <Typography component="span" sx={{ verticalAlign: 'middle', ml: 0.5 }} color="GrayText">
                      {sum > configsQuery.data.data.packageThreshold ? (
                        <Package fontSize={24} />
                      ) : (
                        <EnvelopeSimple fontSize={20} />
                      )}
                    </Typography>
                  )}
                </span>
              );
            })()}
          </Typography>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            出貨
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
