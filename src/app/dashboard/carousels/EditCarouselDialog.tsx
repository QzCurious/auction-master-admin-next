'use client';

import { isDemoMode } from '@/config/demo';
import { type carousel, type carouselGroup } from '@/db/schema';
import EditIcon from '@mui/icons-material/Edit';
import { Dialog, DialogTitle } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';

import CarouselFormDialogContent from './CarouselFormDialogContent';

export default function EditCarouselDialog(props: {
  carousel: typeof carousel.$inferSelect;
  groups: (typeof carouselGroup.$inferSelect)[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton disabled={isDemoMode} onClick={() => setOpen(true)}>
        <EditIcon />
      </IconButton>

      {open && (
        <Dialog open onClose={() => setOpen(false)} closeAfterTransition>
          <DialogTitle>編輯輪播圖</DialogTitle>
          <CarouselFormDialogContent carousel={props.carousel} groups={props.groups} onSuccess={() => setOpen(false)} />
        </Dialog>
      )}
    </>
  );
}
