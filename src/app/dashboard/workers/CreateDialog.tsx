'use client';

import { useState } from 'react';
import { WORKER_TYPE } from '@/domain/static/static-config-mappers';
import { CreateWorker } from '@/api/backend/workers/CreateWorker';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const Schema = z.object({
  type: z.string().min(1, '必填'),
  url: z.string().min(1, '必填'),
});

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.output<typeof Schema>>({
    defaultValues: {
      type: '' as any,
      url: '',
    },
    resolver: zodResolver(Schema),
  });

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
        variant="contained"
      >
        新增
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <form
          onSubmit={handleSubmit(async (data) => {
            const res = await CreateWorker({ ...data });
            if (res.error) {
              enqueueSnackbar(res.error, { variant: 'error' });
              return;
            }
            enqueueSnackbar('新增成功', { variant: 'success' });
            setOpen(false);
          })}
        >
          <DialogTitle>新增 Worker</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={2}>
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>類型</InputLabel>
                    <Select {...field} label="類型" fullWidth>
                      {WORKER_TYPE.data.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.message}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="url"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField label="IP" type="text" {...field} />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
              送出
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
