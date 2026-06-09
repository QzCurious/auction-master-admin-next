'use client';

import { useTransition } from 'react';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { IconButton } from '@mui/material';
import copy from 'copy-to-clipboard';

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function CopyButton({ text }: { text: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <IconButton
      size="small"
      type="button"
      onClick={() =>
        startTransition(async () => {
          copy(text);
          await wait(1000);
        })
      }
    >
      {!isPending ? (
        <ContentCopyOutlinedIcon sx={{ fontSize: 'var(--icon-fontSize-sm)' }} />
      ) : (
        <CheckOutlinedIcon sx={{ fontSize: 'var(--icon-fontSize-sm)' }} color="success" />
      )}
    </IconButton>
  );
}
