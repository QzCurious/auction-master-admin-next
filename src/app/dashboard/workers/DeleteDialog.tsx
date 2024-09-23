'use client';

import { DeleteWorker } from '@/api/backend/workers/DeleteWorker';
import { type Worker } from '@/api/backend/workers/GetWorkers';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

export default function DeleteDialog({ worker }: { worker: Worker }) {
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
          await DeleteWorker(worker.id);
          enqueueSnackbar(`${worker.name} 已刪除`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
