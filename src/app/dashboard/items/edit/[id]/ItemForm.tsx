'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ITEM_STATUS_MAP, ITEM_TYPE_DATA, ITEM_TYPE_MAP } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminUpdateItem } from '@/api/backend/items/AdminUpdateItem';
import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { StatusFlow } from '@/StatusFlow';
import { zodResolver } from '@hookform/resolvers/zod';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import { Button, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import type Quill from 'quill/core';
import { Delta } from 'quill/core';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { useHavePermissions } from '@/contexts/UserContext';
import QuillTextEditor from '@/components/QuillTextEditor/QuillTextEditor';

interface ItemFromProps {
  item: Item;
  consignor: Consignor;
}

export type FormSchemaType = z.output<typeof FormSchema>;
const FormSchema = z
  .object({
    consignorID: z.number(),
    type: z.number().refine((v) => v === 0 || ITEM_TYPE_DATA.find((item) => item.value === v)),
    name: z.string().min(1, '必填'),
    description: z.string().default(''),
    directPurchasePrice: z.number(),
    minEstimatedPrice: z.coerce.number().optional(),
    maxEstimatedPrice: z.coerce.number().optional(),
    reservePrice: z.number().min(1, '必填'),
    warehouseID: z.string(),
    space: z.number().min(1, '必填'),
    grossWeight: z.number(),
    volumetricWeight: z.number(),
    status: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== ITEM_TYPE_MAP['AppraisableAuctionItemType']) {
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
  const defaultValues = useMemo(
    () => ({
      consignorID: item.consignorID,
      type: item.type,
      name: item.name,
      description: item.description ? item.description : JSON.stringify(new Delta().insert('\n').ops),
      directPurchasePrice: item.directPurchasePrice,
      minEstimatedPrice: item.minEstimatedPrice,
      maxEstimatedPrice: item.maxEstimatedPrice,
      reservePrice: item.reservePrice,
      warehouseID: item.warehouseID,
      space: item.space,
      grossWeight: item.grossWeight,
      volumetricWeight: item.volumetricWeight,
      status: item.status,
    }),
    [
      item.consignorID,
      item.description,
      item.directPurchasePrice,
      item.grossWeight,
      item.maxEstimatedPrice,
      item.minEstimatedPrice,
      item.name,
      item.reservePrice,
      item.space,
      item.status,
      item.type,
      item.volumetricWeight,
      item.warehouseID,
    ]
  );
  const form = useForm<z.input<typeof FormSchema>>({
    defaultValues,
    resolver: zodResolver(FormSchema),
  });

  // 編輯成功後重置表單，對應 server data
  const { reset } = form;
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function ItemForm({ item, consignor }: ItemFromProps) {
  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    getValues,
    reset,
  } = useFormContext<z.output<typeof FormSchema>>();
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();
  const canUpdate =
    havePermissions(['AdminUpdateItem']) &&
    item.status !== ITEM_STATUS_MAP.BiddingStatus &&
    // 判斷是否為最後一個狀態
    !Object.values(StatusFlow.flow)
      .filter((f) => f.nexts.length === 0)
      .map((f) => ITEM_STATUS_MAP[f.status])
      .includes(item.status as never);

  const quillRef = useRef<Quill>(null);

  const handleReset = useCallback(() => {
    reset();
    quillRef.current?.setContents(
      item.description ? new Delta({ ops: JSON.parse(item.description) }) : new Delta().insert('\n').ops
    );
  }, [item.description, reset]);
  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <Card
      sx={{ py: 2, px: 3 }}
      component="form"
      onSubmit={handleSubmit(async (data) => {
        const res = await AdminUpdateItem(
          item.id,
          data.type === ITEM_TYPE_MAP['FixedPriceItemType'] ||
            data.type === ITEM_TYPE_MAP['NonAppraisableAuctionItemType']
            ? R.omit(data, ['minEstimatedPrice', 'maxEstimatedPrice'])
            : data
        );
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
        {process.env.NODE_ENV === 'development' && (
          <Button onClick={() => console.log(getValues())}>Get form values</Button>
        )}

        {isDirty && (
          <Button type="button" color="secondary" variant="text" onClick={handleReset}>
            重設
          </Button>
        )}
        {canUpdate && (
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            送出
          </Button>
        )}
      </Stack>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="consignorID"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  value={consignor.nickname}
                  // {...field}
                  inputProps={{ readOnly: true }}
                  label="寄售人"
                  type="text"
                  fullWidth
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs />

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField {...field} label="名稱" type="text" fullWidth InputProps={{ readOnly: !canUpdate }} />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>類型</InputLabel>
                <Select {...field} label="類型" fullWidth readOnly={!canUpdate}>
                  {item.type === 0 && <MenuItem value={0}>(待定)</MenuItem>}
                  {ITEM_TYPE_DATA.map((type) => (
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
            name="directPurchasePrice"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="直購金額"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: !canUpdate,
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
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
                    readOnly: !canUpdate,
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {watch('type') === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && (
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
                        readOnly: !canUpdate,
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
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
                        readOnly: !canUpdate,
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
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
            name="warehouseID"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField {...field} label="倉庫編號" type="text" fullWidth InputProps={{ readOnly: !canUpdate }} />
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
                  label="物品占用空間"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{ readOnly: !canUpdate }}
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
                  InputProps={{ readOnly: !canUpdate }}
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
                  InputProps={{ readOnly: !canUpdate }}
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
                  ref={quillRef}
                  readOnly={!canUpdate}
                  defaultValue={new Delta({ ops: JSON.parse(field.value) })}
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
