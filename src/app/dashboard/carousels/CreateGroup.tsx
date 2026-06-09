'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  TextField,
} from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createCarouselGroup } from './actions';

const Schema = z.object({
  name: z.string().min(1, '必填'),
});

export default function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<z.output<typeof Schema>>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(Schema),
  });

  return (
    <>
      <Button onClick={() => setOpen(true)} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="text">
        新增群組
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <form
          onSubmit={handleSubmit(async (data) => {
            const res = await createCarouselGroup({ ...data });
            if (res.error) {
              enqueueSnackbar(res.error, { variant: 'error' });
              return;
            }
            enqueueSnackbar('新增成功', { variant: 'success' });
            setOpen(false);
            reset();
          })}
        >
          <DialogTitle>新增群組</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={2}>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField label="群組名稱" type="text" {...field} />
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
