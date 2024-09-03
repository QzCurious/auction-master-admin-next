'use client';

import { type Record } from '@/api/backend/reports/GetRecords';
import { RecordPaymentReview } from '@/api/backend/reports/RecordPaymentReview';
import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

function ApprovePaymentButton({ recordId }: { recordId: Record['id'] }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Button size="small" variant="contained" color="primary" {...bindTrigger(popupState)}>
        確認付款
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="確認付款完成"
        description="將此交易標示為已付款"
        onConfirm={async () => {
          const res = await RecordPaymentReview(recordId, { action: 'approve' });
          if (res.error) {
            enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
            return;
          }
          enqueueSnackbar(`已確認付款`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}

function RejectPaymentButton({ recordId }: { recordId: Record['id'] }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Button size="small" variant="outlined" color="error" {...bindTrigger(popupState)}>
        取消付款
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="取消付款"
        description='將此交易標示為取消付款'
        onConfirm={async () => {
          const res = await RecordPaymentReview(recordId, { action: 'reject' });
          if (res.error) {
            enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
            return;
          }
          enqueueSnackbar(`已取消付款`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}

export function ReviewSubmitPaymentButtons({ recordId }: { recordId: Record['id'] }) {
  return (
    <Stack direction="row" spacing={1}>
      <RejectPaymentButton recordId={recordId} />
      <ApprovePaymentButton recordId={recordId} />
    </Stack>
  );
}
