import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSearchParams } from 'next/navigation';
import type React from 'react';

export function FilterPopup({
  label,
  field,
  transform,
  onRemove,
  children,
}: {
  label: string;
  field: string;
  transform?: (value: string) => string;
  onRemove?: () => void;
  children?: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const value = searchParams.get(field) || '';
  const popupState = usePopupState({
    variant: 'popover',
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
          <Typography color="primary" variant="subtitle2">
            : {transform ? transform(value) : value}
          </Typography>
        )}
      </Button>
      <Popover
        sx={{ mt: 1 }}
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
          {children}
        </Stack>
      </Popover>
    </>
  );
}
