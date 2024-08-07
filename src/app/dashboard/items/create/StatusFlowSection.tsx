'use client';

import { useEffect, useState } from 'react';
import { ITEM_STATUS } from '@/api/backend/configs.data';
import { AdminUpdateItem } from '@/api/backend/items/AdminUpdateItem';
import { type Item } from '@/api/backend/items/GetItemAndDetails';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button, Chip, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';

export default function StatusFlowSection({ item }: { item: Item }) {
  const [status, setStatus] = useState(item.status);
  useEffect(() => setStatus(item.status), [item.status]);

  const [showMore, setShowMore] = useState(false);
  const popupState = usePopupState({
    variant: 'popover',
  });
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Card
      sx={{
        py: 2,
        px: 3,
        position: 'relative',
        minWidth: 'fit-content',
        width: { xs: '100%', md: 220 },
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      <Typography variant="h6">狀態流程</Typography>

      <HavePermissionsOnly permissionKeys={['AdminUpdateItem']}>
        <IconButton sx={{ position: 'absolute', top: 6, right: 6 }} onClick={() => setShowMore(!showMore)}>
          <MoreVertIcon />
        </IconButton>

        {showMore && (
          <Stack mt={2.5} mb={5} mx={-1} spacing={1}>
            <FormControl fullWidth>
              <InputLabel>狀態</InputLabel>
              <Select
                label="狀態"
                size="small"
                renderValue={(v) => <Chip label={ITEM_STATUS.get('value', v).message} />}
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                {ITEM_STATUS.data.map((type) => (
                  <MenuItem key={type.value} value={type.value} title={`${type.key} ${type.value}`}>
                    {type.message}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button size="small" variant="contained" color="error" {...bindTrigger(popupState)}>
              更新
            </Button>
            <DoubleCheckPopover
              {...bindPopover(popupState)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              title="更新物品狀態"
              description="此欄位修改需再確認"
              onConfirm={async () => {
                const res = await AdminUpdateItem(item.id, { status });
                if (res.error) {
                  enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                  setShowMore(false);
                  return;
                }
                enqueueSnackbar('已更新物品狀態', { variant: 'success' });
                setShowMore(false);
                popupState.close();
              }}
              onCancel={popupState.close}
            />
          </Stack>
        )}
      </HavePermissionsOnly>
    </Card>
  );
}
