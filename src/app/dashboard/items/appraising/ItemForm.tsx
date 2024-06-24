'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ITEM_TYPE_DATA, ITEM_TYPE_MAP } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/getConsignor';
import { changeItemPhotoSort } from '@/api/backend/items/changeItemPhotoSort';
import { deleteItemPhoto } from '@/api/backend/items/deleteItemPhoto';
import { type Item } from '@/api/backend/items/getItem';
import { reviewItem } from '@/api/backend/items/reviewItem';
import { updateItem } from '@/api/backend/items/updateItem';
import { uploadItemPhotos } from '@/api/backend/items/uploadItemPhotos';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ClearIcon from '@mui/icons-material/Clear';
import { Button, colors, Grid, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
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

const PhotoListSchema = z.object({
  photos: z
    .array(
      z.union([
        z.object({ photo: z.string(), sorted: z.number() }),
        z.instanceof(File).refine((file) => file.size <= 20 * 1024 * 1024, { message: '上限 20MB' }),
      ])
    )
    .min(1, { message: '最少 1 張' })
    .max(30, { message: '最多 30 張' }),
});

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
    <>
      <Box mt={2}>
        <ImageListForm item={item} />
      </Box>

      <Box mt={4}>
        <FormProvider {...form}>
          <WithInFormContext item={item} consignor={consignor} />
        </FormProvider>
      </Box>
    </>
  );
}

function ImageListForm({ item }: { item: Item }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { control } = useForm<z.input<typeof PhotoListSchema>>({
    defaultValues: {
      photos: item.photos ?? [],
    },
    resolver: zodResolver(PhotoListSchema),
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: 'photos',
  });
  const [isPending, startTransition] = useTransition();

  return (
    <Card sx={{ py: 2, px: 3, position: 'relative' }}>
      {isPending && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'inherit',
          }}
        />
      )}

      <Stack direction="row" columnGap={2} justifyContent="space-between">
        <Typography variant="h6">
          物品照片{' '}
          <Typography component="span" variant="body2" color="GrayText">
            (自動儲存)
          </Typography>
        </Typography>

        <Button type="button" variant="contained" onClick={() => inputRef.current?.click()}>
          新增
        </Button>
        <input
          ref={inputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          hidden
          multiple
          onChange={async (e) => {
            const files = e.target.files;
            if (!files) return;
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
              formData.append('photo', files[i]);
              formData.append('sorted', `${i + item.photos.length + 1}`);
            }
            startTransition(async () => {
              await uploadItemPhotos(item.id, formData);
              for (const f of Array.from(files)) {
                append(f);
              }
            });
          }}
        />
      </Stack>

      <Box position="relative">
        <Stack direction="row" mt={1} py={1} sx={{ overflowX: 'auto' }} spacing={3}>
          {fields.map((field, i) => (
            <Controller
              key={field.id}
              name={`photos.${i}`}
              control={control}
              render={({ field }) => (
                <ImageItem
                  src={field.value}
                  onDelete={() => {
                    startTransition(async () => {
                      await deleteItemPhoto(item.id, i + 1);
                      remove(i);
                    });
                  }}
                  onMoveUp={
                    i !== 0 &&
                    (() => {
                      startTransition(async () => {
                        await changeItemPhotoSort(item.id, {
                          originalSorted: i + 1,
                          newSorted: i,
                        });
                        move(i, i - 1);
                      });
                    })
                  }
                  onMoveDown={
                    i !== fields.length - 1 &&
                    (() => {
                      startTransition(async () => {
                        await changeItemPhotoSort(item.id, {
                          originalSorted: i + 1,
                          newSorted: i,
                        });
                        move(i, i + 1);
                      });
                    })
                  }
                />
              )}
            />
          ))}
        </Stack>
      </Box>
    </Card>
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
    <Stack rowGap={3}>
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
        </Grid>
      </Card>

      <Stack direction="row" spacing={2} justifyContent="end">
        <RejectBtn item={item} />
        <ApproveBtn item={item} />
      </Stack>
    </Stack>
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
    type: type === 0 ? '請選類型' : null,
    minEstimatedPrice:
      type === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && !minEstimatedPrice ? '請輸入最低估值' : null,
    maxEstimatedPrice:
      type === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && !maxEstimatedPrice ? '請輸入最高估值' : null,
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
            for (const [key, error] of Object.entries(errors)) {
              if (error) {
                setError(key as keyof typeof errors, { message: error });
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

function ImageItem({
  src,
  error,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  src: z.input<typeof PhotoListSchema>['photos'][number];
  error?: string;
  onDelete?: () => void;
  onMoveUp?: (() => void) | false;
  onMoveDown?: (() => void) | false;
}) {
  const [url, setUrl] = useState('photo' in src ? src.photo : URL.createObjectURL(src));

  useEffect(() => {
    if ('photo' in src) {
      setUrl(src.photo);
      return;
    }

    const url = URL.createObjectURL(src);
    setUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [src]);

  return (
    <div>
      <Box component="article" sx={{ backgroundColor: colors.grey[100], position: 'relative', borderRadius: 1 }}>
        <Box
          component="img"
          sx={{
            width: 320,
            aspectRatio: '16/10',
            pointerEvents: 'none',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
          src={'photo' in src ? src.photo : url}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: 'fit-content',
            pr: 0.5,
            pt: 0.5,
          }}
        >
          {onDelete && (
            <IconButton
              type="button"
              sx={{
                backgroundColor: '#fff',
                opacity: 0.8,
                ':hover': { backgroundColor: '#fff', opacity: 1 },
              }}
              size="small"
              onClick={() => onDelete()}
            >
              <Box sx={visuallyHidden}>刪除</Box>
              <ClearIcon />
            </IconButton>
          )}
        </Box>
        <Stack
          direction="row"
          gap={2}
          sx={{ position: 'absolute', bottom: 0, right: 0, height: 'fit-content', pr: 0.5, pt: 0.5 }}
        >
          <IconButton
            type="button"
            size="small"
            sx={{
              backgroundColor: onMoveUp ? '#fff' : '#fff4',
              pointerEvents: onMoveUp ? 'auto' : 'none',
              opacity: onMoveUp ? 0.8 : 0.5,
              ':hover': { backgroundColor: '#fff', opacity: 1 },
            }}
            onClick={() => onMoveUp && onMoveUp()}
          >
            <Box sx={visuallyHidden}>向上移</Box>
            <ArrowBackIcon />
          </IconButton>

          <IconButton
            type="button"
            size="small"
            sx={{
              backgroundColor: onMoveDown ? '#fff' : '#fff4',
              pointerEvents: onMoveDown ? 'auto' : 'none',
              opacity: onMoveDown ? 0.8 : 0.5,
              ':hover': { backgroundColor: '#fff', opacity: 1 },
            }}
            onClick={() => onMoveDown && onMoveDown()}
          >
            <Box sx={visuallyHidden}>向下移</Box>
            <ArrowForwardIcon />
          </IconButton>
        </Stack>
      </Box>
      {error && <p className="text-end text-sm text-red-600">{error}</p>}
    </div>
  );
}
