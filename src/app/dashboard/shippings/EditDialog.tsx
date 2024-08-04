'use client';

import { useEffect, useMemo, useState } from 'react';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { UpdateAuctionItem } from '@/api/backend/auction-items/UpdateAuctionItem';
import { type Worker } from '@/api/backend/workers/GetActivationWorkers';
import { zodResolver } from '@hookform/resolvers/zod';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const Schema = z.object({
  watcherID: z.number(),
  sellerID: z.number(),
  reservePrice: z.number(),
});

export default function EditDialog({
  auctionItem,
  activationWorkers,
}: {
  auctionItem: AuctionItem;
  activationWorkers: Worker[];
}) {
  const defaultValues = useMemo(
    () => ({
      watcherID: auctionItem.watcherID,
      sellerID: auctionItem.sellerID,
      reservePrice: auctionItem.reservePrice,
    }),
    [auctionItem]
  );
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<z.output<typeof Schema>>({
    defaultValues,
    resolver: zodResolver(Schema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const sellerWorker = activationWorkers.filter((w) => w.type === 'Seller');
  const watcherWorker = activationWorkers.filter((w) => w.type === 'Watcher');

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <EditIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <form
          onSubmit={handleSubmit(async (data) => {
            const res = await UpdateAuctionItem(auctionItem.id, { ...data });
            if (res.error) {
              enqueueSnackbar(res.error, { variant: 'error' });
              return;
            }
            enqueueSnackbar('更新成功', { variant: 'success' });
            setOpen(false);
          })}
        >
          <DialogTitle>更新日拍競標商品</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={2}>
              <Controller
                control={control}
                name="sellerID"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>出品帳號</InputLabel>
                    <Select {...field} label="出品帳號" fullWidth displayEmpty>
                      {sellerWorker.length === 0 && (
                        <MenuItem disabled value="">
                          無可用帳號
                        </MenuItem>
                      )}
                      {sellerWorker.map((worker) => (
                        <MenuItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="watcherID"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>盯標帳號</InputLabel>
                    <Select {...field} label="盯標帳號" fullWidth displayEmpty>
                      {watcherWorker.length === 0 && (
                        <MenuItem disabled value="">
                          無可用帳號
                        </MenuItem>
                      )}
                      {watcherWorker.map((worker) => (
                        <MenuItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

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
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                    />
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
