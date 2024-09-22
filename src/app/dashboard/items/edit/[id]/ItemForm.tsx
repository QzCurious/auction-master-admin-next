'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminUpdateItem } from '@/api/backend/items/AdminUpdateItem';
import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { currencySign } from '@/domain/static/static';
import { ITEM_STATUS, ITEM_TYPE } from '@/domain/static/static-config-mappers';
import { StatusFlow } from '@/domain/static/StatusFlow';
import { zodResolver } from '@hookform/resolvers/zod';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Button, Grid, IconButton, InputAdornment, InputLabel, Link, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import type Quill from 'quill/core';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

const QuillTextEditor = dynamic(() => import('@/components/QuillTextEditor/QuillTextEditor'), { ssr: false });
const emptyDelta = [{ insert: '\n' }];

interface ItemFromProps {
  item: Item;
  consignor: Consignor;
}

export type FormSchemaType = z.output<typeof FormSchema>;
const FormSchema = z
  .object({
    consignorID: z.number(),
    type: z.number().refine(R.isIncludedIn([0, ...ITEM_TYPE.data.map((item) => item.value)])),
    isNew: z.coerce.boolean(),
    name: z.string().min(1, '必填'),
    description: z.string().default(''),
    directPurchasePrice: z.number(),
    minEstimatedPrice: z.coerce.number().optional(),
    maxEstimatedPrice: z.coerce.number().optional(),
    reservePrice: z.number().min(1, '必填'),
    expireAt: z.coerce.date().nullable(),
    warehouseID: z.string(),
    space: z.number(),
    shippingCostsWithinJapan: z.number(),
    grossWeight: z.number(),
    volumetricWeight: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== ITEM_TYPE.enum('AppraisableAuctionItemType')) {
      return;
    }
    if (!data.minEstimatedPrice) {
      ctx.addIssue({ code: 'custom', path: ['minEstimatedPrice'], message: '必填' });
    }
    if (!data.maxEstimatedPrice) {
      ctx.addIssue({ code: 'custom', path: ['maxEstimatedPrice'], message: '必填' });
    }
    if (
      data.minEstimatedPrice != null &&
      data.maxEstimatedPrice != null &&
      data.minEstimatedPrice >= data.maxEstimatedPrice
    ) {
      ctx.addIssue({ code: 'custom', message: '需大於最低估值', path: ['maxEstimatedPrice'] });
    }
  });

export function ItemFormProvider({ item, children }: { item: Item; children: React.ReactNode }) {
  const form = useForm<z.input<typeof FormSchema>>({
    values: {
      consignorID: item.consignorID,
      type: item.type,
      isNew: item.isNew,
      name: item.name,
      description: item.description ? item.description : JSON.stringify(emptyDelta),
      directPurchasePrice: item.directPurchasePrice,
      minEstimatedPrice: item.minEstimatedPrice,
      maxEstimatedPrice: item.maxEstimatedPrice,
      reservePrice: item.reservePrice,
      expireAt: item.expireAt ? new Date(item.expireAt) : null,
      warehouseID: item.warehouseID,
      space: item.space,
      shippingCostsWithinJapan: item.shippingCostsWithinJapan,
      grossWeight: item.grossWeight,
      volumetricWeight: item.volumetricWeight,
    },
    resolver: zodResolver(FormSchema),
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function ItemForm({ item, consignor }: ItemFromProps) {
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
  const canUpdate =
    havePermissions(['AdminUpdateItem']) &&
    item.status !== ITEM_STATUS.enum('BiddingStatus') &&
    // 判斷是否為最後一個狀態
    !Object.values(StatusFlow.flow)
      .filter((f) => f.nexts.length === 0)
      .map((f) => ITEM_STATUS.enum(f.status))
      .includes(item.status as never);

  const quillRef = useRef<Quill>(null);

  return (
    <Card
      sx={{ py: 2, px: 3 }}
      component="form"
      onSubmit={handleSubmit(async (data) => {
        const fixedData =
          data.type !== ITEM_TYPE.enum('AppraisableAuctionItemType')
            ? R.omit(data, ['minEstimatedPrice', 'maxEstimatedPrice'])
            : data;
        const dirtyValues = getDirtyFields(fixedData, dirtyFields);
        if (Object.keys(dirtyValues).length === 0) return;

        const res = await AdminUpdateItem(item.id, dirtyValues);

        if (res.error === '1031') {
          setError('warehouseID', { message: '倉庫編號已存在' });
          return;
        }
        if (res.error) {
          enqueueSnackbar(res.error, { variant: 'error' });
          return;
        }
        enqueueSnackbar('更新成功', { variant: 'success' });
      })}
    >
      <Stack direction="row" columnGap={2}>
        <Typography variant="h6">物品資訊</Typography>
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

        {/* {isDirty && (
          <Button
            type="button"
            color="secondary"
            variant="text"
            onClick={() => {
              if (defaultValues?.description) {
                quillRef.current?.setContents(new Delta({ ops: JSON.parse(defaultValues.description) }));
              }
            }}
          >
            重設
          </Button>
        )} */}
        {canUpdate && (
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            送出
          </Button>
        )}
      </Stack>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <HavePermissionsOnly permissions={['AdminGetConsignor']}>
            <TextField
              value={consignor.nickname}
              inputProps={{ readOnly: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      LinkComponent={Link}
                      size="small"
                      color="primary"
                      href={`/dashboard/consignors?consignorID=${consignor.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <LaunchOutlinedIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              label="寄售人"
              type="text"
              fullWidth
            />
          </HavePermissionsOnly>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>類型</InputLabel>
                <Select
                  {...field}
                  label="類型"
                  fullWidth
                  readOnly={!canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['type'] }])}
                >
                  {item.type === 0 && <MenuItem value={0}>(待定)</MenuItem>}
                  {ITEM_TYPE.data.map((type) => (
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
            name="name"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="名稱"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['name'] }]),
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
            name="isNew"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>是否為全新品</InputLabel>
                <Select
                  {...field}
                  label="是否為全新品"
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  fullWidth
                  readOnly={!canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['isNew'] }])}
                >
                  <MenuItem value="true">是</MenuItem>
                  <MenuItem value="false">否</MenuItem>
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="directPurchasePrice"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="收購金額"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly:
                      !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['directPurchasePrice'] }]),
                    startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="reservePrice"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="期望金額"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['reservePrice'] }]),
                    startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {watch('type') === ITEM_TYPE.enum('AppraisableAuctionItemType') && (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name="minEstimatedPrice"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="最低估值"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                      }}
                      InputProps={{
                        readOnly:
                          !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['minEstimatedPrice'] }]),
                        startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="maxEstimatedPrice"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="最高估值"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                      }}
                      InputProps={{
                        readOnly:
                          !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['maxEstimatedPrice'] }]),
                        startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
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
            name="expireAt"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <DatePicker
                  {...field}
                  label="過期時間"
                  format="yyyy/MM/dd"
                  // slotProps={{ field: { clearable: true } }}
                  readOnly={!canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['expireAt'] }])}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="warehouseID"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="倉庫編號"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['warehouseID'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="space"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="佔用空間"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['space'] }]),
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="shippingCostsWithinJapan"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="日本運費"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly:
                      !canUpdate ||
                      !havePermissions([{ key: 'AdminUpdateItem', fields: ['shippingCostsWithinJapan'] }]),
                    startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="grossWeight"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="實際重量"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['grossWeight'] }]),
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="volumetricWeight"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="體積重量"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly:
                      !canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['volumetricWeight'] }]),
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack mb={1} direction="row" spacing={0.5} alignItems="center">
            <Typography variant="h6">描述</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 0, mb: -0.5 }}>
              <IconButton size="small" type="button" onClick={() => copy(quillRef.current?.getSemanticHTML() ?? '')}>
                <IntegrationInstructionsOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <QuillTextEditor
                  quillRef={quillRef}
                  readOnly={!canUpdate || !havePermissions([{ key: 'AdminUpdateItem', fields: ['description'] }])}
                  defaultValue={field.value}
                  onTextChange={(delta, oldDelta) => field.onChange(JSON.stringify(oldDelta.compose(delta).ops))}
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
