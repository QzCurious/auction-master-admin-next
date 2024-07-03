'use client';

import {
  ITEM_STATUS_DATA,
  ITEM_STATUS_MAP,
  ITEM_STATUS_MESSAGE_MAP,
  ITEM_TYPE_DATA,
  ITEM_TYPE_MAP,
} from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/getConsignor';
import { changeItemPhotoSort } from '@/api/backend/items/changeItemPhotoSort';
import { deleteItemPhoto } from '@/api/backend/items/deleteItemPhoto';
import { type Item } from '@/api/backend/items/getItem';
import { itemArrival } from '@/api/backend/items/itemArrival';
import { itemBidding } from '@/api/backend/items/itemBidding';
import { itemCompleteDetail } from '@/api/backend/items/itemCompleteDetail';
import { reviewItem } from '@/api/backend/items/reviewItem';
import { updateItem } from '@/api/backend/items/updateItem';
import { uploadItemPhotos } from '@/api/backend/items/uploadItemPhotos';
import { useObjectURL } from '@/helper/useObjectURL';
import { zodResolver } from '@hookform/resolvers/zod';
import ClearIcon from '@mui/icons-material/Clear';
import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Button,
  Chip,
  colors,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { useGesture } from '@use-gesture/react';
import { useMotionValue } from 'framer-motion';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import type React from 'react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import { useHandleNoPermissions } from '@/contexts/UserContext';

interface ItemFromProps {
  item: Item;
  consignor: Consignor;
}

const FormSchema = z
  .object({
    status: z.number(),
    consignorID: z.number(),
    type: z.number().optional(),
    name: z.string().min(1, '必填'),
    description: z.string().nullable(),
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

export default function ItemForm({ item, consignor }: ItemFromProps) {
  const defaultValues = useMemo(
    () => ({
      ...R.pick(item, [
        'status',
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
function ImageListForm({ item }: { item: Item }) {
  const theme = useTheme();
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
  const { createUrl, revokeUrl } = useObjectURL();
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState<HTMLElement | null>(null);
  const draggingXy = useMotionValue<[number, number]>([0, 0]);
  const [onto, setOnto] = useState<HTMLElement | null>(null);
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const bind = useGesture({
    onDrag: ({ args, active, xy }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const i: number = args[0];
      if (!active) return;
      setIsDragging(refs.current[i]);
      draggingXy.set(xy);
      const target = refs.current.find((el) => el && document.elementsFromPoint(...xy).includes(el));
      if (!target) {
        setOnto(null);
        setSide(null);
        return;
      }
      setOnto(target);
      const rect = target.getBoundingClientRect();
      const side = xy[0] < rect.x + rect.width / 2 ? 'left' : 'right';
      setSide(side);
    },
    onDragEnd: ({ args }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const i: number = args[0];
      setIsDragging(null);
      draggingXy.set([0, 0]);
      setOnto(null);
      setSide(null);
      if (onto && side) {
        const ontoI = refs.current.indexOf(onto);
        if (ontoI === i) return;
        if (side === 'left' && ontoI - 1 === i) return;
        if (side === 'right' && ontoI + 1 === i) return;

        startTransition(async () => {
          await changeItemPhotoSort(item.id, {
            originalSorted: i + 1,
            newSorted: ontoI + 1,
          });
          move(i, ontoI);
        });
      }
    },
  });

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

        <Button type="button" variant="contained" onClick={() => document.getElementById('file-upload')?.click()}>
          新增
        </Button>
        <input
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

      <Box position="relative" overflow="hidden">
        {isDragging && (
          <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 2, transform: 'translateX(-50%)' }}>
            <ScrollPad whileHover={() => containerRef.current?.scrollBy({ left: -5 })} />
          </Box>
        )}

        <Box ref={containerRef} position="relative" sx={{ overflowX: 'auto' }}>
          <Stack direction="row" mt={1} mx={-1}>
            {fields.map((field, i) => (
              <Controller
                key={field.id}
                name={`photos.${i}`}
                control={control}
                render={({ field, fieldState }) => (
                  <Box
                    ref={(el: HTMLElement) => {
                      refs.current[i] = el;
                    }}
                    sx={{
                      borderWidth: 0,
                      borderStyle: 'solid',
                      borderColor: theme.palette.primary.main,
                      position: 'relative',
                      px: 1,
                      borderLeftWidth: onto === refs.current[i] && side === 'left' ? 2 : 0,
                      borderRightWidth: onto === refs.current[i] && side === 'right' ? 2 : 0,
                    }}
                  >
                    <Box component="article" sx={{ backgroundColor: colors.grey[100], position: 'relative' }}>
                      <Box
                        component="img"
                        sx={{
                          width: 320,
                          aspectRatio: '16/10',
                          pointerEvents: 'none',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          borderRadius: 1,
                        }}
                        src={'photo' in field.value ? field.value.photo : createUrl(field.value)}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ position: 'absolute', top: 0, right: 0, height: 'fit-content', pr: 1, pt: 1 }}
                      >
                        <IconButton
                          type="button"
                          sx={{
                            backgroundColor: '#fff',
                            opacity: 0.8,
                            ':hover': { backgroundColor: '#fff', opacity: 1 },
                          }}
                          size="small"
                          onClick={() => {
                            startTransition(async () => {
                              field.value instanceof File && revokeUrl(field.value);
                              await deleteItemPhoto(item.id, i + 1);
                              remove(i);
                            });
                          }}
                        >
                          <Box sx={visuallyHidden}>刪除</Box>
                          <ClearIcon />
                        </IconButton>

                        <IconButton
                          type="button"
                          size="small"
                          sx={{
                            touchAction: 'none',
                            backgroundColor: '#fff',
                            opacity: 0.8,
                            ':hover': { backgroundColor: '#fff', opacity: 1 },
                          }}
                          {...bind(i)}
                        >
                          <DragHandleOutlinedIcon sx={{ transform: 'rotate(90deg)' }} />
                        </IconButton>
                      </Stack>
                    </Box>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </Box>
                )}
              />
            ))}
          </Stack>
        </Box>

        {isDragging && (
          <Box sx={{ position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 2, transform: 'translateX(50%)' }}>
            <ScrollPad whileHover={() => containerRef.current?.scrollBy({ left: 5 })} />
          </Box>
        )}
      </Box>
    </Card>
  );
}

function ScrollPad({ whileHover }: { whileHover?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    function handle(e: PointerEvent) {
      const hovered = !!ref.current && document.elementsFromPoint(e.clientX, e.clientY).includes(ref.current);
      setActive(hovered);
    }
    document.addEventListener('pointermove', handle);
    return () => document.removeEventListener('pointermove', handle);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      whileHover?.();
    }, 20);
    return () => clearInterval(id);
  }, [active, whileHover]);

  return (
    <Box
      ref={ref}
      sx={{
        height: '100%',
        maxHeight: '100%',
        width: 80,
      }}
    >
      <Box
        sx={{
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          borderRadius: 99999,
          background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2) 50%, transparent)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    </Box>
  );
}

function WithInFormContext({ item, consignor }: ItemFromProps) {
  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    getValues,
    setValue,
    reset,
  } = useFormContext<z.input<typeof FormSchema>>();
  const { enqueueSnackbar } = useSnackbar();
  const handleNoPermissions = useHandleNoPermissions();
  const readOnly = item.status !== ITEM_STATUS_MAP.SubmitAppraisalStatus;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
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
          {!readOnly && (
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              onClick={handleNoPermissions(['AdminUpdateItem'])}
            >
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
                  <TextField {...field} label="名稱" type="text" fullWidth InputProps={{ readOnly }} />
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
                  <Select {...field} label="類型" fullWidth readOnly={readOnly}>
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
                  <TextField
                    {...field}
                    label="描述"
                    type="text"
                    fullWidth
                    multiline
                    minRows={2}
                    InputProps={{ readOnly }}
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
                    label="空間"
                    type="number"
                    fullWidth
                    onChange={(e) => {
                      field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                    }}
                    InputProps={{ readOnly }}
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
                    InputProps={{ readOnly }}
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
                        InputProps={{ readOnly }}
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
                        InputProps={{ readOnly }}
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

      <StatueFlow item={item} />
    </Stack>
  );
}

function StatueFlow({ item }: { item: Item }) {
  const [status, setStatus] = useState(item.status);
  useEffect(() => setStatus(item.status), [item.status]);

  const [showMore, setShowMore] = useState(false);
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Card
      sx={{
        py: 2,
        px: 3,
        position: 'relative',
        minWidth: 'fit-content',
        width: { xs: '100%', md: 220 },
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      <Typography variant="h6">狀態流程</Typography>

      <IconButton sx={{ position: 'absolute', top: 6, right: 6 }} onClick={() => setShowMore(!showMore)}>
        <MoreVertIcon />
      </IconButton>

      {showMore && (
        <Stack mt={2.5} mb={5} mx={-1} spacing={1}>
          <FormControl fullWidth>
            <InputLabel>狀態</InputLabel>
            <Select
              label="狀態"
              size="small"
              renderValue={(v) => <Chip label={ITEM_STATUS_DATA.find(({ value }) => value === v)?.message} />}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              {ITEM_STATUS_DATA.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.message}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button size="small" variant="contained" color="error" {...bindTrigger(popupState)}>
            更新
          </Button>
          <DoubleCheckPopover
            {...bindPopover(popupState)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            title="更新物品狀態"
            description="此欄位修改需再確認"
            onConfirm={async () => {
              const res = await updateItem(item.id, { status });
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                setShowMore(false);
                return;
              }
              enqueueSnackbar('已更新物品狀態', { variant: 'success' });
              setShowMore(false);
              popupState.close();
            }}
          />
        </Stack>
      )}

      <Box mt={2}>
        <StatusStep
          text={ITEM_STATUS_MESSAGE_MAP['SubmitAppraisalStatus']}
          active={item.status === ITEM_STATUS_MAP['SubmitAppraisalStatus']}
        >
          {item.status === ITEM_STATUS_MAP['SubmitAppraisalStatus'] && (
            <>
              <RejectBtn
                text="審核失敗"
                popoverTitle="標記為審核失敗"
                onConfirm={async () => {
                  const res = await reviewItem(item.id, { action: 'reject' });
                  if (res.error) {
                    enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                    return;
                  }
                  enqueueSnackbar('已將物品標記為審核失敗', { variant: 'success' });
                }}
              />
              <ApproveBtn
                text="審核通過"
                popoverTitle="標記為審核通過"
                onConfirm={async () => {
                  const res = await reviewItem(item.id, { action: 'approve' });
                  if (res.error) {
                    enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                    return;
                  }
                  enqueueSnackbar('已將物品標記為審核成功', { variant: 'success' });
                }}
              />
            </>
          )}
        </StatusStep>

        {item.status === ITEM_STATUS_MAP['AppraisalFailureStatus'] ? (
          <StatusStep failed text={ITEM_STATUS_MESSAGE_MAP['AppraisalFailureStatus']} />
        ) : (
          <StatusStep
            text={ITEM_STATUS_MESSAGE_MAP['AppraisedStatus']}
            active={item.status === ITEM_STATUS_MAP['AppraisedStatus']}
          />
        )}

        {item.status === ITEM_STATUS_MAP['ConsignmentCanceledStatus'] ? (
          <StatusStep failed text={ITEM_STATUS_MESSAGE_MAP['ConsignmentCanceledStatus']} />
        ) : (
          <StatusStep
            text={ITEM_STATUS_MESSAGE_MAP['ConsignmentApprovedStatus']}
            active={item.status === ITEM_STATUS_MAP['ConsignmentApprovedStatus']}
          >
            {item.status === ITEM_STATUS_MAP['ConsignmentApprovedStatus'] && (
              <>
                <RejectBtn
                  text="退貨"
                  popoverTitle="標記為退貨"
                  onConfirm={async () => {
                    const res = await itemArrival(item.id, { action: 'reject' });
                    if (res.error) {
                      enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                      return;
                    }
                    enqueueSnackbar('已將物品標記為退貨', { variant: 'success' });
                  }}
                />
                <ApproveBtn
                  text="到貨"
                  popoverTitle="標記為到貨"
                  onConfirm={async () => {
                    const res = await itemArrival(item.id, { action: 'approve' });
                    if (res.error) {
                      enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                      return;
                    }
                    enqueueSnackbar('已將物品標記為到貨', { variant: 'success' });
                  }}
                />
              </>
            )}
          </StatusStep>
        )}

        {item.status === ITEM_STATUS_MAP['WarehouseReturnPendingStatus'] ? (
          <StatusStep
            text={ITEM_STATUS_MESSAGE_MAP['WarehouseReturnPendingStatus']}
            active={item.status === ITEM_STATUS_MAP['WarehouseReturnPendingStatus']}
          />
        ) : (
          <>
            <StatusStep
              text={ITEM_STATUS_MESSAGE_MAP['WarehouseArrivalStatus']}
              active={item.status === ITEM_STATUS_MAP['WarehouseArrivalStatus']}
            >
              {item.status === ITEM_STATUS_MAP['WarehouseArrivalStatus'] && (
                <>
                  <RejectBtn
                    text="退貨"
                    popoverTitle="標記為退貨"
                    onConfirm={async () => {
                      const res = await itemArrival(item.id, { action: 'reject' });
                      if (res.error) {
                        enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                        return;
                      }
                      enqueueSnackbar('已將物品標記為退貨', { variant: 'success' });
                    }}
                  />

                  <ApproveBtn
                    text="可出售"
                    popoverTitle="標記為可出售"
                    onConfirm={async () => {
                      const res = await itemCompleteDetail(item.id);
                      if (res.error) {
                        enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                        return;
                      }
                      enqueueSnackbar('已將物品標記為可出售', { variant: 'success' });
                    }}
                  />
                </>
              )}
            </StatusStep>
            <StatusStep
              text={ITEM_STATUS_MESSAGE_MAP['DetailsFullyCompletedStatus']}
              active={item.status === ITEM_STATUS_MAP['DetailsFullyCompletedStatus']}
            />
            <StatusStep
              text={ITEM_STATUS_MESSAGE_MAP['ReadyStatus']}
              active={item.status === ITEM_STATUS_MAP['ReadyStatus']}
            >
              {item.status === ITEM_STATUS_MAP['ReadyStatus'] && (
                <ApproveBtn
                  text="上架"
                  popoverTitle="標記為上架"
                  onConfirm={async () => {
                    const res = await itemBidding(item.id);
                    if (res.error) {
                      enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                      return;
                    }
                    enqueueSnackbar('已將物品標記為上架', { variant: 'success' });
                  }}
                />
              )}
            </StatusStep>
          </>
        )}
      </Box>
    </Card>
  );
}

function StatusStep({
  text,
  children,
  ...props
}: {
  text: string;
  children?: React.ReactNode;
} & ({ active: boolean } | { failed: boolean })) {
  const active = 'active' in props ? props.active : false;
  const failed = 'failed' in props ? props.failed : false;

  return (
    <Stack
      direction="row"
      alignItems="start"
      position="relative"
      spacing={1.5}
      sx={{
        pb: 2,
        '&[data-active]~[data-status-step]': {
          '--color': 'var(--mui-palette-grey-400)',
        },
        '&[data-active], &[data-active]~[data-status-step]': {
          '--tail-color': 'var(--mui-palette-grey-400)',
        },
        '&:last-of-type': { '[data-tail]': { display: 'none' } },
        '&[data-failed] [data-tail],&[data-failed]~[data-status-step]': { display: 'none' },
      }}
      data-status-step
      data-active={active ? true : undefined}
      data-failed={failed ? true : undefined}
    >
      <Box
        data-tail
        sx={{
          position: 'absolute',
          top: 8,
          left: 4,
          right: 0,
          height: '100%',
          width: 2,
          bgcolor: 'var(--tail-color, var(--mui-palette-primary-main))',
        }}
      />
      <Stack height={21} justifyContent="center" position="relative">
        <Box
          sx={{
            width: 10,
            height: 10,
            bgcolor: failed ? 'var(--mui-palette-grey-600)' : 'var(--color, var(--mui-palette-primary-main))',
            borderRadius: '50%',
          }}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography
          variant="body2"
          sx={{
            color: failed || active ? 'var(--mui-palette-text-primary)' : 'var(--mui-palette-grey-600)',
          }}
        >
          {text}
        </Typography>

        {children && (
          <Stack direction="row" spacing={2} justifyContent="end">
            {children}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

function RejectBtn({ text, popoverTitle, onConfirm }: { text: string; popoverTitle: string; onConfirm: () => void }) {
  const {
    formState: { isDirty },
  } = useFormContext<z.input<typeof FormSchema>>();
  const popupState = usePopupState({
    variant: 'popover',
  });

  return (
    <>
      <Button
        {...bindTrigger(popupState)}
        type="submit"
        size="small"
        color="error"
        variant="outlined"
        disabled={isDirty}
      >
        {text}
      </Button>
      <DoubleCheckPopover {...bindPopover(popupState)} title={popoverTitle} onConfirm={onConfirm} />
    </>
  );
}

function ApproveBtn({ text, popoverTitle, onConfirm }: { text: string; popoverTitle: string; onConfirm: () => void }) {
  const {
    formState: { isDirty },
  } = useFormContext<z.input<typeof FormSchema>>();
  const popupState = usePopupState({
    variant: 'popover',
  });

  return (
    <>
      <Button {...bindTrigger(popupState)} type="submit" size="small" variant="contained" disabled={isDirty}>
        {text}
      </Button>
      <DoubleCheckPopover {...bindPopover(popupState)} title={popoverTitle} onConfirm={onConfirm} />
    </>
  );
}
