'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { UpdateAuctionItem } from '@/api/backend/auction-items/UpdateAuctionItem';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { type Worker } from '@/api/backend/workers/GetWorker';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { currencySign } from '@/domain/static/static';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Button, Grid, InputAdornment, InputLabel, Link, MenuItem, Select, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography/Typography';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

interface EditAuctionItemFromProps {
  auctionItem: AuctionItem;
  consignor?: Consignor;
  item?: Item;
  seller?: Worker;
  watcher?: Worker;
  sellers?: Worker[];
  watchers?: Worker[];
}

export type FormSchemaType = z.output<typeof FormSchema>;
const FormSchema = z.object({
  consignorId: z.number(),
  itemId: z.number(),
  sellerId: z.number(),
  watcherId: z.number(),
  auctionId: z.string(),

  name: z.string(),
  // photo: z.string(),
  reservePrice: z.number(),
  currentPrice: z.number(),
  highestPrice: z.number(),
  closeAt: z.coerce.date(),
  closedPrice: z.number(),
  status: z.coerce.number(),
});

export function AuctionItemFormProvider({
  auctionItem,
  children,
}: {
  auctionItem: AuctionItem;
  children: React.ReactNode;
}) {
  const form = useForm<z.input<typeof FormSchema>>({
    values: {
      consignorId: auctionItem.consignorId,
      itemId: auctionItem.itemId,
      sellerId: auctionItem.sellerId,
      watcherId: auctionItem.watcherId,
      auctionId: auctionItem.auctionId,

      name: auctionItem.name,
      // photo: auctionItem.photo,
      reservePrice: auctionItem.reservePrice,
      currentPrice: auctionItem.currentPrice,
      highestPrice: auctionItem.highestPrice,
      closeAt: new Date(auctionItem.closeAt),
      closedPrice: auctionItem.closedPrice,
      status: auctionItem.status,
    },
    resolver: zodResolver(FormSchema),
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function EditAuctionItemForm({
  auctionItem,
  consignor,
  item,
  seller,
  watcher,
  sellers,
  watchers,
}: EditAuctionItemFromProps) {
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
  const canUpdate = true;

  return (
    <Card
      sx={{ py: 2, px: 3 }}
      component="form"
      onSubmit={handleSubmit(
        async (data) => {
          const dirtyValues = getDirtyFields(data, dirtyFields);
          if (Object.keys(dirtyValues).length === 0) return;

          const res = await UpdateAuctionItem(auctionItem.auctionId, {
            ...dirtyValues,
          });

          if (res.error) {
            enqueueSnackbar(res.error, { variant: 'error' });
            return;
          }
          enqueueSnackbar('更新成功', { variant: 'success' });

          if (process.env.NODE_ENV !== 'development') {
            router.push('/dashboard/auction-items');
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

        {havePermissions(['UpdateAuctionItem']) && canUpdate && (
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            送出
          </Button>
        )}
      </Stack>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        {consignor && (
          <Grid item xs={12} sm={6}>
            <Controller
              control={control}
              name="consignorId"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField
                    // {...field}
                    value={consignor.nickname}
                    label="寄售人"
                    type="text"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      // readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['consignorId'] }]),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            LinkComponent={Link}
                            size="small"
                            color="primary"
                            href={`/dashboard/consignor/edit/${consignor.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LaunchOutlinedIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        )}

        {item && (
          <Grid item xs={12} sm={6}>
            <Controller
              control={control}
              name="itemId"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <TextField
                    // {...field}
                    value={item.name}
                    label="物品"
                    type="text"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      // readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['itemId'] }]),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            LinkComponent={Link}
                            size="small"
                            color="primary"
                            href={`/dashboard/items/edit/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LaunchOutlinedIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        )}

        <HavePermissionsOnly permissions={['GetWorker']}>
          <Grid item xs={12} sm={6}>
            <Controller
              control={control}
              name="sellerId"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>出品帳號</InputLabel>
                  <Select
                    {...field}
                    value={field.value || ''}
                    label="出品帳號"
                    fullWidth
                    sx={{ '&>.MuiSvgIcon-root': { transform: field.value ? 'translateX(-3rem)' : undefined } }}
                    readOnly={!canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['sellerId'] }])}
                    endAdornment={
                      !!field.value && (
                        <InputAdornment position="end">
                          <IconButton
                            LinkComponent={Link}
                            size="small"
                            color="primary"
                            href={`/dashboard/workers/edit/${field.value}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LaunchOutlinedIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    {sellers?.length === 0 && <MenuItem disabled>無可用帳號</MenuItem>}
                    {sellers?.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name || s.account || s.url}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        </HavePermissionsOnly>

        <HavePermissionsOnly permissions={['GetWorker']}>
          <Grid item xs={12} sm={6}>
            <Controller
              control={control}
              name="watcherId"
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>盯標帳號</InputLabel>
                  <Select
                    {...field}
                    value={field.value || ''}
                    label="盯標帳號"
                    fullWidth
                    sx={{ '&>.MuiSvgIcon-root': { transform: field.value ? 'translateX(-3rem)' : undefined } }}
                    readOnly={!canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['watcherId'] }])}
                    endAdornment={
                      !!field.value && (
                        <InputAdornment position="end">
                          <IconButton
                            LinkComponent={Link}
                            size="small"
                            color="primary"
                            href={`/dashboard/workers/edit/${field.value}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LaunchOutlinedIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    {watchers?.length === 0 && <MenuItem disabled>無可用帳號</MenuItem>}
                    {watchers?.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name || s.account || s.url}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        </HavePermissionsOnly>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="auctionId"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="日拍物品代碼"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['auctionId'] }]),
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
            name="name"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="名稱"
                  type="text"
                  fullWidth
                  InputProps={{
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['name'] }]),
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
            name="reservePrice"
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
                    readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['reservePrice'] }]),
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
            control={control}
            name="currentPrice"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="當前金額"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: true,
                    // readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['currentPrice'] }]),
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
            control={control}
            name="highestPrice"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="最高金額"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: true,
                    // readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['highestPrice'] }]),
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
            control={control}
            name="closeAt"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <DateTimePicker
                  {...field}
                  label="結束時間"
                  format="yyyy/MM/dd HH:mm:ss"
                  timeSteps={{ minutes: 1 }}
                  readOnly
                  // readOnly={!havePermissions([{ key: 'UpdateAuctionItem', fields: ['closeAt'] }])}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            control={control}
            name="closedPrice"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  label="結束金額"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }}
                  InputProps={{
                    readOnly: true,
                    // readOnly: !canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['closedPrice'] }]),
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
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>狀態</InputLabel>
                <Select
                  {...field}
                  label="狀態"
                  fullWidth
                  readOnly={!canUpdate || !havePermissions([{ key: 'UpdateAuctionItem', fields: ['status'] }])}
                >
                  {AUCTION_ITEM_STATUS.data.map((type) => (
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
      </Grid>
    </Card>
  );
}
