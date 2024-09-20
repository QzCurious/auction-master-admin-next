'use client';

import type React from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

export function FilterPopover({
  label,
  value,
  onRemove,
  children,
}: {
  label: string;
  value?: string | null;
  onRemove?: () => void;
  children?: React.ReactNode | (({ close }: { close: () => void }) => React.ReactNode);
}) {
  const popupState = usePopupState({
    variant: 'popover',
    disableAutoFocus: true,
  });

  return (
    <>
      <Button
        {...bindTrigger(popupState)}
        type="button"
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={
          value ? (
            <RemoveCircleOutlineIcon
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
            />
          ) : (
            <AddCircleOutlineIcon />
          )
        }
      >
        {label}
        {value && (
          <Typography color="primary" variant="inherit">
            : {value}
          </Typography>
        )}
      </Button>
      <Popover
        sx={{ mt: 1, '.MuiPopover-paper': { border: '1px solid var(--mui-palette-TableCell-border)' } }}
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Stack sx={{ p: '16px 20px' }} gap={1}>
          <Typography variant="subtitle2">以{label}篩選</Typography>
          {typeof children === 'function' ? children({ close: popupState.close }) : children}
        </Stack>
      </Popover>
    </>
  );
}
