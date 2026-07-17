'use client';

import { isDemoMode } from '@/config/demo';
import { type carousel, type carouselGroup } from '@/db/schema';
import { DATE_TIME_FORMAT } from '@/domain/static/static';
import { zodResolver } from '@hookform/resolvers/zod';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createCarousel, updateCarousel, uploadImage } from './actions';

const Schema = z.object({
  groupId: z.number({ message: '必填' }),
  mobileImageUrl: z.custom<File | string>((v) => !!v, '必填'),
  desktopImageUrl: z.custom<File | string>((v) => !!v, '必填'),
  sorted: z.coerce.number().int('請輸入整數'),
  publishAt: z.date({ message: '必填' }),
});

export default function CarouselFormDialogContent({
  groups,
  onSuccess,
  ...props
}: ({ carousel: typeof carousel.$inferSelect } | { groupId: number }) & {
  groups: (typeof carouselGroup.$inferSelect)[];
  onSuccess?: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<z.output<typeof Schema>>({
    values:
      'carousel' in props
        ? props.carousel
        : {
            groupId: props.groupId,
            mobileImageUrl: '' as any,
            desktopImageUrl: '' as any,
            sorted: '' as any,
            publishAt: null as any,
          },
    resolver: zodResolver(Schema),
  });

  return (
    <form
      style={{ display: 'contents' }}
      onSubmit={handleSubmit(async (data) => {
        if (data.mobileImageUrl instanceof File) {
          const mobileImageFormData = new FormData();
          mobileImageFormData.append('file', data.mobileImageUrl as File);
          const mobileImageUploadUrl = await uploadImage(mobileImageFormData);
          data.mobileImageUrl = mobileImageUploadUrl;
        }
        if (data.desktopImageUrl instanceof File) {
          const desktopImageFormData = new FormData();
          desktopImageFormData.append('file', data.desktopImageUrl as File);
          const desktopImageUploadUrl = await uploadImage(desktopImageFormData);
          data.desktopImageUrl = desktopImageUploadUrl;
        }

        if ('carousel' in props) {
          const res = await updateCarousel(props.carousel.id, {
            ...data,
            mobileImageUrl: data.mobileImageUrl as string,
            desktopImageUrl: data.desktopImageUrl as string,
          });
          enqueueSnackbar('更新成功', { variant: 'success' });
          onSuccess?.();
          reset();
        } else {
          const res = await createCarousel({
            ...data,
            mobileImageUrl: data.mobileImageUrl as string,
            desktopImageUrl: data.desktopImageUrl as string,
          });
          enqueueSnackbar('新增成功', { variant: 'success' });
          onSuccess?.();
          reset();
        }
      })}
    >
      <DialogContent>
        <Stack spacing={3}>
          <Controller
            control={control}
            name="groupId"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <InputLabel>群組</InputLabel>
                <Select {...field} disabled={isDemoMode} label="群組" fullWidth>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="mobileImageUrl"
            render={({ field, fieldState }) => {
              const url = typeof field.value === 'string' ? field.value : URL.createObjectURL(field.value);
              return (
                <>
                  {url && (
                    <img
                      ref={(el) => {
                        if (!el) URL.revokeObjectURL(url);
                      }}
                      src={url}
                      alt=""
                    />
                  )}
                  <FormControl fullWidth error={!!fieldState.error} sx={{ position: 'relative' }}>
                    <TextField
                      disabled={isDemoMode}
                      label="手機版圖片"
                      inputProps={{ readOnly: true }}
                      type="text"
                      value={typeof field.value === 'string' ? field.value : field.value?.name}
                      error={!!fieldState.error}
                      helperText="432 x 778"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton disabled={isDemoMode} component="label" htmlFor="mobile-image-file-upload">
                              <FileUploadIcon />
                            </IconButton>
                            <input
                              disabled={isDemoMode}
                              type="file"
                              id="mobile-image-file-upload"
                              accept="image/*"
                              hidden
                              onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.files![0])}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                </>
              );
            }}
          />

          <Controller
            control={control}
            name="desktopImageUrl"
            render={({ field, fieldState }) => {
              const url = typeof field.value === 'string' ? field.value : URL.createObjectURL(field.value);
              return (
                <>
                  {url && (
                    <img
                      ref={(el) => {
                        if (!el) URL.revokeObjectURL(url);
                      }}
                      src={url}
                      alt=""
                    />
                  )}
                  <FormControl fullWidth error={!!fieldState.error} sx={{ position: 'relative' }}>
                    <TextField
                      disabled={isDemoMode}
                      label="桌面版圖片"
                      inputProps={{ readOnly: true }}
                      type="text"
                      value={typeof field.value === 'string' ? field.value : field.value?.name}
                      error={!!fieldState.error}
                      helperText="1080 x 450"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton disabled={isDemoMode} component="label" htmlFor="desktop-image-upload">
                              <FileUploadIcon />
                            </IconButton>
                            <input
                              disabled={isDemoMode}
                              type="file"
                              id="desktop-image-upload"
                              accept="image/*"
                              hidden
                              onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.files![0])}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                </>
              );
            }}
          />

          <Controller
            control={control}
            name="sorted"
            render={({ field, fieldState }) => (
              <FormControl fullWidth>
                <TextField disabled={isDemoMode} label="排序" type="number" {...field} error={!!fieldState.error} />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="publishAt"
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <DateTimePicker
                  {...field}
                  disabled={isDemoMode}
                  label="發佈時間"
                  format="yyyy/MM/dd HH:mm:ss"
                  slotProps={{
                    textField: { error: !!fieldState.error },
                  }}
                  timeSteps={{ minutes: 1 }}
                  ampm={false}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="submit" disabled={isDemoMode || isSubmitting} variant="contained" color="primary">
          送出
        </Button>
      </DialogActions>
    </form>
  );
}
