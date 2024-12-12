'use client';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { enqueueSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

import { deleteCarouselGroup } from './actions';

interface DeleteGroupPopoverProps {
  id: number;
}

export default function DeleteGroupPopover({ id }: DeleteGroupPopoverProps) {
  return (
    <PopupState variant="popover">
      {(popupState) => (
        <>
          <IconButton
            type="button"
            size="small"
            {...bindTrigger(popupState)}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              bindTrigger(popupState).onClick(e);
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <DoubleCheckPopover
            {...bindPopover(popupState)}
            title="刪除群組"
            onConfirm={async () => {
              await deleteCarouselGroup(id);
              enqueueSnackbar('已刪除', { variant: 'success' });
              popupState.close();
            }}
            onCancel={popupState.close}
          />
        </>
      )}
    </PopupState>
  );
}
