'use client';

import { isDemoMode } from '@/config/demo';
import { type carouselGroup } from '@/db/schema';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Dialog, DialogContent, DialogTitle, List, ListItem, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

import { deleteCarouselGroup, updateGroup } from './actions';
import CreateGroupDialog from './CreateGroup';

export default function CarouselGroupsDialog({ groups }: { groups: (typeof carouselGroup.$inferSelect)[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="text">
        群組管理
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} pr={1}>
          <DialogTitle>輪播圖群組</DialogTitle>
          <CreateGroupDialog />
        </Stack>
        <DialogContent sx={{ pt: 0 }}>
          {groups.map((group) => (
            <Row key={group.id} group={group} />
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ group }: { group: typeof carouselGroup.$inferSelect }) {
  const [value, setValue] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  return (
    <List>
      <ListItem disablePadding>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await updateGroup(group.id, {
              name: inputRef.current?.value ?? '',
            });
            enqueueSnackbar(`已更新`, { variant: 'success' });
          }}
        >
          <TextField
            disabled={isDemoMode}
            inputRef={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  disabled={isDemoMode}
                  type="submit"
                  sx={{
                    visibility: value !== group.name ? 'visible' : 'hidden',
                  }}
                  edge="end"
                >
                  <CheckIcon />
                </IconButton>
              ),
            }}
            size="small"
          />
        </form>

        <Box sx={{ ml: 1 }} />

        <DeleteBtn row={group} />
      </ListItem>
    </List>
  );
}

function DeleteBtn({ row }: { row: typeof carouselGroup.$inferSelect }) {
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton {...bindTrigger(popupState)} disabled={isDemoMode}>
        <DeleteIcon />
      </IconButton>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title="刪除輪播圖群組"
        description="您確定要刪除嗎?"
        onConfirm={async () => {
          await deleteCarouselGroup(row.id);
          enqueueSnackbar(`已刪除`, { variant: 'success' });
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}
