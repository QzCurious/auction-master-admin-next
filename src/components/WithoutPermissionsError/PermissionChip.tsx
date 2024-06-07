'use client';

import { Chip, type ChipProps } from '@mui/material';

interface PermissionChipProps extends Omit<ChipProps, 'label' | 'variant' | 'onClick'> {
  label: string;
}

export default function PermissionChip(props: PermissionChipProps) {
  return <Chip variant="outlined" onClick={() => navigator.clipboard.writeText(props.label)} {...props} />;
}
