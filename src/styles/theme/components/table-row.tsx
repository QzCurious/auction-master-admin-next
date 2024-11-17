import type { Components } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

import type { Theme } from '../types';

export const MuiTableRow = {
  styleOverrides: {
    root: {
      ':hover': {
        backgroundColor: 'transparent !important',
      },
      variants: [
        {
          props: { hover: true },
          style: {
            [`& .${tableCellClasses.root}`]: {
              backgroundColor: 'var(--mui-palette-background-paper)',
            },
            ':hover': {
              [`& .${tableCellClasses.root}`]: {
                backgroundColor: 'rgb(240,240,240)',
              },
            },
          },
        },
      ],
    },
  },
} satisfies Components<Theme>['MuiTableRow'];
