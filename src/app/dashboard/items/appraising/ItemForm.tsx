'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ITEM_TYPE_DATA, ITEM_TYPE_MAP } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/getConsignor';
import { type Item } from '@/api/backend/items/getItem';
import { reviewItem } from '@/api/backend/items/reviewItem';
import { updateItem } from '@/api/backend/items/updateItem';
import { DATE_TIME_FORMAT } from '@/static';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { format } from 'date-fns';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { useHandleNoPermissions } from '@/contexts/UserContext';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';

interface ItemFromProps {
  item: Item;
  consignor: Consignor;
}

const FormSchema = z
  .object({
    consignorID: z.number(),
    type: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable(),
    space: z.number().min(1, 'Space is required'),
    minEstimatedPrice: z.coerce.number().optional(),
    maxEstimatedPrice: z.coerce.number().optional(),
    reservePrice: z.number().min(1, 'Reserve price is required'),
  })
  .refine(
    (data) =>
      data.minEstimatedPrice != null && data.maxEstimatedPrice != null
        ? data.minEstimatedPrice <= data.maxEstimatedPrice
        : true,
    { message: '需大於最低估值', path: ['maxEstimatedPrice'] }
  );

export default function ItemForm({ item, consignor }: ItemFromProps) {
  const defaultValues = useMemo(
    () => ({
      ...R.pick(item, [
        'consignorID',
        'type',
        'name',
        'description',
        'space',
        'minEstimatedPrice',
        'maxEstimatedPrice',
        'reservePrice',
      ]),
      description: item.description ?? '',
    }),
    [item]
  );
  const form = useForm<z.input<typeof FormSchema>>({
    defaultValues,
    resolver: zodResolver(FormSchema),
  });

  // 編輯成功後重置表單預設值
  const { reset } = form;
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <FormProvider {...form}>
      <WithInFormContext item={item} consignor={consignor} />
    </FormProvider>
  );
}

function WithInFormContext({ item, consignor }: ItemFromProps) {
  const {
    watch,
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors, isDirty },
    getValues,
    reset,
  } = useFormContext<z.input<typeof FormSchema>>();
  const { enqueueSnackbar } = useSnackbar();
  const handleNoPermissions = useHandleNoPermissions();

  return (
    <>
      <Stack direction="row" justifyContent="end" spacing={3}>
        <Typography variant="body2" color="text.secondary">
          建立時間: {format(item.createdAt, DATE_TIME_FORMAT)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          更新時間: {format(item.updatedAt, DATE_TIME_FORMAT)}
        </Typography>
      </Stack>

      <Stack rowGap={3} mt={2}>
        <Card
          sx={{ py: 2, px: 3 }}
          component="form"
          onSubmit={handleSubmit(async (data) => {
            const res = await updateItem(
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
              <Button type="button" color="secondary" variant="text" onClick={() => reset()}>
                重設
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              onClick={handleNoPermissions(['AdminUpdateItem'])}
            >
              送出
            </Button>
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
                    <TextField {...field} label="名稱" type="text" fullWidth />
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
                    <Select {...field} label="類型" fullWidth>
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

            <Grid item xs={12} sm={12}>
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField {...field} label="描述" type="text" fullWidth multiline minRows={2} />
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
                      label="空間"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
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
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {watch('type') === ITEM_TYPE_MAP['FixedPriceItemType'] ||
              watch('type') === ITEM_TYPE_MAP['NonAppraisableAuctionItemType'] || (
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
                          />
                          {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </>
              )}
          </Grid>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="end">
          <RejectBtn item={item} />
          <ApproveBtn item={item} />
        </Stack>
      </Stack>
    </>
  );
}

function RejectBtn({ item }: { item: Item }) {
  const {
    watch,
    formState: { isDirty },
  } = useFormContext<z.input<typeof FormSchema>>();
  const popupState = usePopupState({
    variant: 'popover',
  });
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Button {...bindTrigger(popupState)} type="submit" color="error" variant="outlined" disabled={isDirty}>
        審核失敗
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="標記為審核失敗"
        onConfirm={async () => {
          const res = await reviewItem(item.id, { action: 'reject' });
          if (res.error) {
            enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
            return;
          }
          enqueueSnackbar('已將物品標記為審核失敗', { variant: 'success' });
          router.push('/dashboard/items/appraising');
        }}
      />
    </>
  );
}

function ApproveBtn({ item }: { item: Item }) {
  const {
    watch,
    setError,
    formState: { isDirty },
  } = useFormContext<z.input<typeof FormSchema>>();
  const popupState = usePopupState({
    variant: 'popover',
  });
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const type = watch('type');
  const minEstimatedPrice = watch('minEstimatedPrice');
  const maxEstimatedPrice = watch('maxEstimatedPrice');

  const errors = {
    type: type === 0 ? '請選擇審核方式' : null,
    minEstimatedPrice:
      type === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && minEstimatedPrice ? null : '請輸入最低估值',
    maxEstimatedPrice:
      type === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && maxEstimatedPrice ? null : '請輸入最高估值',
  };

  return (
    <>
      <Button
        {...bindTrigger(popupState)}
        type="submit"
        variant="contained"
        disabled={isDirty}
        {...(Object.values(errors).some(Boolean) && {
          onClick: () => {
            for (const [key, value] of Object.entries(errors)) {
              if (value) {
                setError(key as keyof typeof errors, { message: value });
              }
            }
          },
        })}
      >
        審核成功
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="標記為審核成功"
        onConfirm={async () => {
          const res = await reviewItem(item.id, { action: 'approve' });
          if (res.error) {
            enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
            return;
          }
          enqueueSnackbar('已將物品標記為審核成功', { variant: 'success' });
          router.push('/dashboard/items/appraising');
        }}
      />
    </>
  );
}
