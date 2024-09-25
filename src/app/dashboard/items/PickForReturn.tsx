'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GetItemAndDetailQueryOptions } from '@/api/backend/items/GetItemAndDetail.query';
import { ItemReturning } from '@/api/backend/items/ItemReturning';
import { GetConfigsQueryOptions } from '@/api/GetConfigs.query';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { currencySign } from '@/domain/static/static';
import { SHIPMENT_TYPE } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  InputAdornment,
  List,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Provider, useAtom, useAtomValue } from 'jotai';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { ListItemSkeleton, pickedItemIdsReducerAtom, PickedListItem } from './PickingList';
import { type SearchParamsSchema } from './SearchParamsSchema';

export function PickForReturnButtons({
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
            newSearchParams.set('picking', 'return');
            newSearchParams.set('stage', 'picking');
            router.replace(`?${newSearchParams}`);
          }}
        >
          選取退貨
        </Button>
      )}
      {picking === 'return' && stage === 'picking' && (
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
      {picking === 'return' && stage === 'picking' && pickedItemIds.length > 0 && (
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
          安排退貨
        </Button>
      )}
    </Stack>
  );
}

export function PickForReturn({ picking, stage }: Pick<z.output<typeof SearchParamsSchema>, 'picking' | 'stage'>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Drawer
      PaperProps={{ sx: { width: 360 } }}
      anchor="right"
      open={picking === 'return' && stage === 'checking'}
      onClose={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('stage', 'picking');
        router.replace(`?${newSearchParams}`);
      }}
    >
      <ReturnItemsForm />
    </Drawer>
  );
}

const Schema = z.object({
  shippingCostsWithinJapan: z.number({ message: '必填' }).min(0),
  address: z.string().min(1, { message: '必填' }),
  recipientName: z.string().min(1, { message: '必填' }),
  phone: z.string().min(1, { message: '必填' }),
});
function ReturnItemsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItemIds = useAtomValue(pickedItemIdsReducerAtom);
  const itemQueries = useQueries({
    queries: pickedItemIds.map(GetItemAndDetailQueryOptions),
  });

  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<z.output<typeof Schema>>({
    defaultValues: {
      address: '',
      recipientName: '',
      phone: '',
      shippingCostsWithinJapan: '' as any,
    },
    resolver: zodResolver(Schema),
  });

  const configsRes = useQuery(GetConfigsQueryOptions());
  if (configsRes.error) return null;
  if (configsRes.isPending) return null;

  if (itemQueries.some((q) => q.data?.error === '1001')) {
    return <WithoutPermissionsError permissions={['GetItemAndDetails']} />;
  }
  if (itemQueries.some((q) => q.data?.error === '1003')) {
    return <RedirectAuthError />;
  }

  const queries = itemQueries.filter((q) => !q.isError);
  const shippingCostsWithinJapan = watch('shippingCostsWithinJapan');

  return (
    <Provider>
      <Stack
        component="form"
        sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}
        onSubmit={handleSubmit(async (data) => {
          const res = await ItemReturning({
            shipmentType: SHIPMENT_TYPE.enum('AddressShipmentType'),
            address: data.address,
            phone: data.phone,
            recipientName: data.recipientName,
            itemID: pickedItemIds,
            consignorID: Number(searchParams.get('consignorID')),
            shippingCosts: shippingCostsWithinJapan,
          });

          if (res.error) {
            enqueueSnackbar(res.error, { variant: 'error' });
            return;
          }

          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('consignorID');
          newSearchParams.delete('picking');
          newSearchParams.delete('stage');
          router.replace(`?${newSearchParams}`);
          enqueueSnackbar('已開立退貨單', { variant: 'success' });
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
                      label="運費"
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

            <FormControl fullWidth>
              <TextField
                size="small"
                label="總留倉費"
                fullWidth
                type="number"
                value={R.sum(
                  itemQueries.map((i) =>
                    i.data?.data?.expireAt ? i.data.data.space * configsRes.data.data!.costPerSpace : 0
                  )
                )}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currencySign('TWD')}</InputAdornment>,
                  readOnly: true,
                }}
              />
            </FormControl>

            <Controller
              control={control}
              name="shippingCostsWithinJapan"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField
                    {...field}
                    size="small"
                    label="運費"
                    fullWidth
                    type="number"
                    onChange={(e) => {
                      field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{currencySign('TWD')}</InputAdornment>,
                    }}
                    inputProps={{ min: 0 }}
                  />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">
              共 {itemQueries.length} 件
              {/* 運費總計 {currencySign('JPY')}
              {(() => {
                const sum = R.sum(shippingCostsWithinJapan.map((v) => v || 0));
                if (Number.isNaN(sum)) {
                  return 0;
                }
                return sum.toLocaleString();
              })()} */}
            </Typography>

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              退貨
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Provider>
  );
}
