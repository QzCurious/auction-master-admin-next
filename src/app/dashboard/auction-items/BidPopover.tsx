'use client';

import { BidAuctionItem } from '@/api/backend/auction-items/BidAuctionItem';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import {
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Gavel } from '@phosphor-icons/react/dist/csr/Gavel';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';

export default function BidPopover({ auctionItem }: { auctionItem: AuctionItem }) {
  const popupState = usePopupState({
    variant: 'popover',
  });

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <Gavel />
      </IconButton>
      <Popover
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        {...bindPopover(popupState)}
      >
        <BidPopoverContent auctionItem={auctionItem} />
      </Popover>
    </>
  );
}

function BidPopoverContent({ auctionItem }: { auctionItem: AuctionItem }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      price: '',
    },
  });

  return (
    <Box sx={{ p: '16px 20px' }}>
      <Typography variant="subtitle1">立即下標</Typography>
      <Typography color="text.secondary" variant="body2">
        立即下標並將商品加入日拍競標清單
      </Typography>
      <form
        onSubmit={handleSubmit(async (data) => {
          const res = await BidAuctionItem(auctionItem.id, {
            price: parseInt(data.price),
          });
          if (res.error) {
            enqueueSnackbar(`下標失敗: ${res.error}`, { variant: 'error' });
            return;
          }
          enqueueSnackbar('下標成功', { variant: 'success' });
        })}
      >
        <Stack direction="row" gap={2} alignItems="start" sx={{ mt: 1 }}>
          <Controller
            name="price"
            control={control}
            rules={{
              required: { value: true, message: '請輸入下標金額' },
              min: { value: auctionItem.currentPrice + 1, message: '不可小於當前金額' },
            }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <TextField
                  {...field}
                  size="small"
                  type="number"
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e.target.value === '' ? '' : parseInt(e.target.value));
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  }}
                />
                {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Button disabled={isSubmitting} type="submit" variant="contained" size="small">
            確定
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
