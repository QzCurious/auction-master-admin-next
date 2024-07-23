'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  TextField,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const Schema = z.object({
  itemID: z.string().min(1, '必填'),
  auctionID: z.string().min(1, '必填'),
});

export default function CreateAuctionItemDialog() {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.output<typeof Schema>>({
    defaultValues: {
      itemID: '',
      auctionID: '',
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
            // const res = await CreateAuctionItem({ itemID: data.itemID, auctionID: data.auctionID });
            // if (res.error) {
            //   enqueueSnackbar(res.error, { variant: 'error' });
            //   return;
            // }
            // enqueueSnackbar('更新成功', { variant: 'success' });
          })}
        >
          <DialogTitle>新增日拍競標商品</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={2}>
              <Controller
                control={control}
                name="itemID"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField label="物品ID" type="text" {...field} />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="auctionID"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField label="日拍ID" type="text" {...field} />
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
