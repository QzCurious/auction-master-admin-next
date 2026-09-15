'use client';

import { type Record } from '@/api/backend/reports/GetRecords';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { useRunApiMutation } from '@/domain/data/useRunApiMutation';
import { RecordPaymentReview } from '@/server-action/backend/reports/RecordPaymentReview';
import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

function ApprovePaymentButton({ recordId }: { recordId: Record['id'] }) {
  const runApiMutation = useRunApiMutation();
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleApiError = useHandleApiError();

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
          const res = await runApiMutation(
            [['records'], ['/reports/records'], ['/reports/records/summary'], ['reports'], ['wallets'], ['bonus']],
            () => RecordPaymentReview(recordId, { action: 'approve' })
          );
          if (res.error) {
            handleApiError(res.error);
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
  const runApiMutation = useRunApiMutation();
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleApiError = useHandleApiError();

  return (
    <>
      <Button size="small" variant="outlined" color="error" {...bindTrigger(popupState)}>
        取消付款
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="取消付款"
        description="將此交易標示為取消付款"
        onConfirm={async () => {
          const res = await runApiMutation(
            [['records'], ['/reports/records'], ['/reports/records/summary'], ['reports'], ['wallets'], ['bonus']],
            () => RecordPaymentReview(recordId, { action: 'reject' })
          );
          if (res.error) {
            handleApiError(res.error);
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
