'use client';

import { Chip, type ChipProps } from '@mui/material';
import copy from 'copy-to-clipboard';

interface PermissionChipProps extends Omit<ChipProps, 'label' | 'variant' | 'onClick'> {
  label: string;
}

export default function PermissionChip(props: PermissionChipProps) {
  return <Chip variant="outlined" onClick={() => copy(props.label)} {...props} />;
}
