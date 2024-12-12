'use client';

import { useState } from 'react';
import { type carouselGroup } from '@/db/schema';
import { Button, Dialog, DialogTitle } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import CarouselFormDialogContent from './CarouselFormDialogContent';

export default function CreateCarouselDialog({
  groupId,
  groups,
}: {
  groupId: number;
  groups: (typeof carouselGroup.$inferSelect)[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
        variant="contained"
      >
        新增
      </Button>

      {open && (
        <Dialog open onClose={() => setOpen(false)} closeAfterTransition>
          <DialogTitle>新增輪播圖</DialogTitle>
          <CarouselFormDialogContent groupId={groupId} groups={groups} onSuccess={() => setOpen(false)} />
        </Dialog>
      )}
    </>
  );
}
