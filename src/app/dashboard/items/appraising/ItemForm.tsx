'use client';

import { useRouter } from 'next/navigation';
import { ITEM_TYPE_DATA, ITEM_TYPE_MAP } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/getConsignor';
import { type Item } from '@/api/backend/items/getItem';
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
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import { useHandleNoPermissions } from '@/contexts/UserContext';

interface ItemFromProps {
  item: Item;
  consignor: Consignor;
}

const FormSchema = z.object({
  consignorID: z.number(),
  type: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  space: z.number().min(1, 'Space is required'),
  minEstimatedPrice: z.coerce.number().optional(),
  maxEstimatedPrice: z.coerce.number().optional(),
  reservePrice: z.number().min(1, 'Reserve price is required'),
});

export default function ItemForm({ item, consignor }: ItemFromProps) {
  const router = useRouter();
  const {
    watch,
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<z.input<typeof FormSchema>>({
    defaultValues: {
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
    },
    resolver: zodResolver(FormSchema),
  });
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
            router.push('/dashboard/items/appraising');
          })}
        >
          <Stack direction="row" columnGap={2}>
            <Typography variant="h6">物品資訊</Typography>
            <Box sx={{ ml: 'auto' }} />
            {process.env.NODE_ENV === 'development' && (
              <Button onClick={() => console.log(getValues())}>Get form values</Button>
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
                      <MenuItem value={0}>(待定)</MenuItem>
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
      </Stack>
    </>
  );
}
