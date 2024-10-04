'use client';

import { type Shipping } from '@/api/backend/shippings/GetShipping';
import { UpdateShipping } from '@/api/backend/shippings/UpdateShipping';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { currencySign } from '@/domain/static/static';
import { ACTION_TYPE, SHIPMENT_TYPE, SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { literal, z } from 'zod';

interface EditShippingFromProps {
  shipping: Shipping;
}

export type FormSchemaType = z.output<typeof FormSchema>;
const FormSchema = z
  .object({
    actionType: z.number().refine(R.isIncludedIn(ACTION_TYPE.data.map((item) => item.value))),
    shipmentType: z.number().refine(R.isIncludedIn(SHIPMENT_TYPE.data.map((item) => item.value))),
    // itemIDs: z.array(z.number()),
    // auctionIds: z.array(z.string()),
    address: z.string().min(1, '必填'),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string().min(1, '必填'),
    phone: z.string().min(1, '必填'),
    shipmentTrackingNumber: z.string(),
    internationalShippingCosts: z.number().or(literal('')),
    remark: z.string(),
    status: z.number().refine(R.isIncludedIn(SHIPPING_STATUS.data.map((item) => item.value))),
  })
  .superRefine((data, ctx) => {
    if (
      [SHIPMENT_TYPE.enum('SevenElevenShipmentType'), SHIPMENT_TYPE.enum('FamilyShipmentType')].includes(
        data.shipmentType
      )
    ) {
      if (!data.storeName) ctx.addIssue({ code: 'custom', path: ['storeName'], message: '必填' });
      if (!data.storeNumber) ctx.addIssue({ code: 'custom', path: ['storeNumber'], message: '必填' });
    }
  });

export function ShippingFormProvider({ shipping, children }: { shipping: Shipping; children: React.ReactNode }) {
  const form = useForm<z.input<typeof FormSchema>>({
    values: {
      actionType: shipping.actionType,
      shipmentType: shipping.shipmentType,
      // itemIDs: shipping.itemIDs,
      // auctionIds: shipping.auctionIds,
      address: shipping.address,
      storeNumber: shipping.storeNumber ?? '',
      storeName: shipping.storeName ?? '',
      recipientName: shipping.recipientName,
      phone: shipping.phone,
      shipmentTrackingNumber: shipping.shipmentTrackingNumber ?? '',
      internationalShippingCosts: shipping.internationalShippingCosts ?? ('' as any),
      remark: shipping.remark ?? '',
      status: shipping.status,
    },
    resolver: zodResolver(FormSchema),
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function EditShippingForm({ shipping }: EditShippingFromProps) {
  const router = useRouter();
  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting, dirtyFields, defaultValues },
    getValues,
    setError,
  } = useFormContext<z.output<typeof FormSchema>>();
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();
  const canUpdate = !R.isIncludedIn(shipping.status, [
    SHIPPING_STATUS.enum('ClosedStatus'),
    SHIPPING_STATUS.enum('CanceledStatus'),
  ]);

  const shipmentType = watch('shipmentType');

  return (
    <Card
      sx={{ py: 2, px: 3 }}
      component="form"
      onSubmit={handleSubmit(
        async (data) => {
          const dirtyValues = getDirtyFields(data, dirtyFields);
          if (Object.keys(dirtyValues).length === 0) return;

          if (shipping.shipmentTrackingNumber != null && dirtyValues.shipmentTrackingNumber === '') {
            setError('shipmentTrackingNumber', { message: '必填' });
            return;
          }
          if (shipping.internationalShippingCosts != null && dirtyValues.internationalShippingCosts === '') {
            setError('internationalShippingCosts', { message: '必填' });
            return;
          }

          const res = await UpdateShipping(shipping.id, {
            ...dirtyValues,
            internationalShippingCosts:
              dirtyValues.internationalShippingCosts === '' ? undefined : dirtyValues.internationalShippingCosts,
          });

          if (res.error) {
            enqueueSnackbar(res.error, { variant: 'error' });
            return;
          }
          enqueueSnackbar('更新成功', { variant: 'success' });

          if (process.env.NODE_ENV !== 'development') {
            router.push('/dashboard/shippings');
          }
        },
        (err) => {
          console.log(err);
        }
      )}
    >
      <Stack direction="row" columnGap={2}>
        <Typography variant="h6">出貨資訊</Typography>
        <Box sx={{ ml: 'auto' }} />

        {process.env.NODE_ENV === 'development' && <Button onClick={() => router.refresh()}>Refetch</Button>}
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => {
              console.log('values', getValues());
              console.log('dirtyFields', dirtyFields);
              console.log('defaultValues', defaultValues);
            }}
          >
            Log values
          </Button>
        )}

        {havePermissions(['UpdateShipping']) && canUpdate && (
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            送出
          </Button>
        )}
      </Stack>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="shipmentTrackingNumber"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="出貨單號"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly:
                      !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['shipmentTrackingNumber'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>狀態</InputLabel>
                <Select
                  {...field}
                  label="狀態"
                  fullWidth
                  readOnly={!canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['status'] }])}
                >
                  {SHIPPING_STATUS.data.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.message}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="actionType"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>出貨類型</InputLabel>
                <Select
                  {...field}
                  label="出貨類型"
                  fullWidth
                  readOnly={!canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['actionType'] }])}
                >
                  {ACTION_TYPE.data.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.message}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="shipmentType"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>配送方式</InputLabel>
                <Select
                  {...field}
                  label="配送方式"
                  fullWidth
                  readOnly={!canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['shipmentType'] }])}
                >
                  {SHIPMENT_TYPE.data.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.message}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {[SHIPMENT_TYPE.enum('SevenElevenShipmentType'), SHIPMENT_TYPE.enum('FamilyShipmentType')].includes(
          shipmentType
        ) && (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="storeNumber"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="門市代號"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['storeNumber'] }]),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                control={control}
                name="storeName"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="門市名稱"
                      type="text"
                      fullWidth
                      InputProps={{
                        readOnly: !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['storeName'] }]),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="收貨地址"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['address'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="internationalShippingCosts"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="國際運費"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly:
                      !canUpdate ||
                      !havePermissions([{ key: 'UpdateShipping', fields: ['internationalShippingCosts'] }]),
                    startAdornment: <InputAdornment position="start">{currencySign('TWD')}</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="recipientName"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="收貨人姓名"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['recipientName'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="收貨人電話"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['phone'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="remark"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="備註"
                  type="text"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={6}
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateShipping', fields: ['remark'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
