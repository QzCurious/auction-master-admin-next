import type React from 'react';
import { useTransition } from 'react';
import { Box, Button, Popover, Stack, Typography, type PopoverProps } from '@mui/material';

interface DoubleCheckPopoverProps extends Omit<PopoverProps, 'title'> {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function DoubleCheckPopover({
  title,
  description,
  onConfirm,
  onCancel,
  ...props
}: DoubleCheckPopoverProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Popover
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      {...props}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
        <Stack direction="row" gap={2} justifyContent="space-between" sx={{ mt: 1 }}>
          <Button variant="text" size="small" onClick={() => startTransition(async () => onCancel())}>
            取消
          </Button>
          <Button
            disabled={isPending}
            variant="contained"
            size="small"
            onClick={() => {
              startTransition(async () => onConfirm());
            }}
          >
            確定
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}
