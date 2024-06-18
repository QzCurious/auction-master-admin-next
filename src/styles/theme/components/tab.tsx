import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiTabs = {
  styleOverrides: {
    root: {
      '& .MuiTabs-indicator': {
        borderRadius: '9999px 9999px 0px 0px',
        height: '3px',
      },
    },
  },
} satisfies Components<Theme>['MuiTab'];

export const MuiTab = {
  styleOverrides: {
    root: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.71,
      minWidth: 'auto',
      paddingLeft: 0,
      paddingRight: 0,
      textTransform: 'none',
      '& + &': { marginLeft: '24px' },
    },
  },
} satisfies Components<Theme>['MuiTab'];
