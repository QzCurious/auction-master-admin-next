'use client';

import { type Worker } from '@/api/backend/workers/GetWorkers';
import { useHandleApiError as useHandleMutationError } from '@/domain/api/HandleApiError';
import { useRunApiMutation } from '@/domain/data/useRunApiMutation';
import { DeleteWorker } from '@/server-action/backend/workers/DeleteWorker';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

export default function DeleteDialog({ worker }: { worker: Worker }) {
  const handleMutationError = useHandleMutationError();
  const runApiMutation = useRunApiMutation();
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <DeleteIcon />
      </IconButton>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="刪除 Worker"
        description={`您確定要刪除 ${worker.name} 嗎?`}
        onConfirm={async () => {
          const mutationResult = await runApiMutation('DeleteWorker', () => DeleteWorker(worker.id));
          if (mutationResult.error) {
            handleMutationError(mutationResult.error);
            return;
          }
          enqueueSnackbar(`${worker.name} 已刪除`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
