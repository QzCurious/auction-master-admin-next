'use client';

import { useRouter } from 'next/navigation';
import { ITEM_TYPE_DATA, ITEM_TYPE_MAP } from '@/api/backend/configs.data';
import { type Consignor } from '@/api/backend/consignor/getConsignor';
import { type Item } from '@/api/backend/items/getItem';
import { itemArrival } from '@/api/backend/items/itemArrival';
import { Button, colors, Grid, TextField } from '@mui/material';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

interface ItemFromProps {
  item: Item;
  consignor: Consignor;
}

export default function ItemForm({ item, consignor }: ItemFromProps) {
  return (
    <>
      <Box mt={2}>
        <Card sx={{ py: 2, px: 3, position: 'relative' }}>
          <Stack direction="row" columnGap={2} justifyContent="space-between">
            <Typography variant="h6">物品照片 </Typography>
          </Stack>

          <Box position="relative">
            <Stack direction="row" mt={1} py={1} sx={{ overflowX: 'auto' }} spacing={3}>
              {item.photos.map((photo) => (
                <Box
                  key={photo.sorted}
                  component="article"
                  sx={{ backgroundColor: colors.grey[100], position: 'relative', borderRadius: 1 }}
                >
                  <Box
                    component="img"
                    sx={{
                      width: 320,
                      aspectRatio: '16/10',
                      pointerEvents: 'none',
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                    src={photo.photo}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        </Card>
      </Box>

      <Box mt={4}>
        <Stack rowGap={3}>
          <Card sx={{ py: 2, px: 3 }} component="form">
            <Stack direction="row" columnGap={2}>
              <Typography variant="h6">物品資訊</Typography>
              <Box sx={{ ml: 'auto' }} />
            </Stack>

            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  inputProps={{ readOnly: true }}
                  label="寄售人"
                  type="text"
                  value={consignor.nickname}
                  fullWidth
                />
              </Grid>

              <Grid item xs />

              <Grid item xs={12} sm={6}>
                <TextField inputProps={{ readOnly: true }} label="名稱" type="text" value={item.name} fullWidth />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  inputProps={{ readOnly: true }}
                  label="類型"
                  type="text"
                  value={ITEM_TYPE_DATA.find(({ value }) => value === item.type)?.message}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  inputProps={{ readOnly: true }}
                  label="描述"
                  type="text"
                  value={item.description}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField inputProps={{ readOnly: true }} label="空間" type="number" value={item.space} fullWidth />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  inputProps={{ readOnly: true }}
                  label="期望金額"
                  type="number"
                  value={item.reservePrice}
                  fullWidth
                />
              </Grid>

              {item.type === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      InputProps={{ readOnly: true }}
                      label="最低估值"
                      type="number"
                      fullWidth
                      value={item.minEstimatedPrice}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      InputProps={{ readOnly: true }}
                      label="最高估值"
                      type="number"
                      value={item.maxEstimatedPrice}
                      fullWidth
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
      </Box>
    </>
  );
}

function RejectBtn({ item }: { item: Item }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Button {...bindTrigger(popupState)} type="submit" color="error" variant="outlined">
        退貨
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="標記為退貨"
        onConfirm={async () => {
          const res = await itemArrival(item.id, { action: 'reject' });
          if (res.error) {
            enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
            return;
          }
          enqueueSnackbar('已將物品標記為退貨', { variant: 'success' });
          router.push('/dashboard/items/consignment-approved-status');
        }}
      />
    </>
  );
}

function ApproveBtn({ item }: { item: Item }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Button {...bindTrigger(popupState)} type="submit" variant="contained">
        到貨
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="標記為到貨"
        onConfirm={async () => {
          const res = await itemArrival(item.id, { action: 'approve' });
          if (res.error) {
            enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
            return;
          }
          enqueueSnackbar('已將物品標記為到貨', { variant: 'success' });
          router.push('/dashboard/items/consignment-approved-status');
        }}
      />
    </>
  );
}
