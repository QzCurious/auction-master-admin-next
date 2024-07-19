'use client';

import type React from 'react';
import { useRef } from 'react';
import { ITEM_TYPE_DATA, ITEM_TYPE_MAP } from '@/api/backend/configs.data';
import { zodResolver } from '@hookform/resolvers/zod';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import { Button, Grid, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import type Quill from 'quill/core';
import { Delta } from 'quill/core';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { ConsignorSelect } from '@/components/ConsignorSelect';
import QuillTextEditor from '@/components/QuillTextEditor/QuillTextEditor';

export type FormSchemaType = z.output<typeof FormSchema>;
const FormSchema = z
  .object({
    status: z.number(),
    consignorID: z.number(),
    type: z.number().optional(),
    name: z.string().min(1, '必填'),
    description: z.string().default(''),
    space: z.number().min(1, '必填'),
    minEstimatedPrice: z.coerce.number().optional(),
    maxEstimatedPrice: z.coerce.number().optional(),
    reservePrice: z.number().min(1, '必填'),
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

export function ItemFormProvider({ children }: { children: React.ReactNode }) {
  const form = useForm<z.input<typeof FormSchema>>({
    defaultValues: {
      status: 0,
      consignorID: null,
      type: 0,
      name: '',
      space: null,
      minEstimatedPrice: null,
      maxEstimatedPrice: null,
      reservePrice: null,
      description: JSON.stringify(new Delta().insert('\n').ops),
    } as any,
    resolver: zodResolver(FormSchema),
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function ItemForm() {
  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    getValues,
    reset,
  } = useFormContext<z.output<typeof FormSchema>>();
  const { enqueueSnackbar } = useSnackbar();
  const quillRef = useRef<Quill>(null);

  return (
    <Card
      sx={{ py: 2, px: 3 }}
      component="form"
      onSubmit={handleSubmit(async (data) => {
        // const res = await AdminUpdateItem(
        //   item.id,
        //   data.type === ITEM_TYPE_MAP['FixedPriceItemType'] ||
        //     data.type === ITEM_TYPE_MAP['NonAppraisableAuctionItemType']
        //     ? R.omit(data, ['minEstimatedPrice', 'maxEstimatedPrice'])
        //     : data
        // );
        // if (res.error) {
        //   enqueueSnackbar(res.error, { variant: 'error' });
        //   return;
        // }
        // enqueueSnackbar('更新成功', { variant: 'success' });
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
        <Button type="submit" variant="contained" disabled={isSubmitting}>
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
                <ConsignorSelect
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  textFieldProps={{ fullWidth: true, label: '寄售人' }}
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
