'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  ITEM_STATUS_DATA,
  ITEM_STATUS_KEY_MAP,
  ITEM_STATUS_MAP,
  ITEM_STATUS_MESSAGE_MAP,
} from '@/api/backend/configs.data';
import { AdminUpdateItem } from '@/api/backend/items/AdminUpdateItem';
import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { ItemAppraisalReview } from '@/api/backend/items/ItemAppraisalReview';
import { ItemArrival } from '@/api/backend/items/ItemArrival';
import { ItemBidding } from '@/api/backend/items/ItemBidding';
import { ItemCompleteDetails } from '@/api/backend/items/ItemCompleteDetails';
import { ItemReturned } from '@/api/backend/items/ItemReturned';
import { ItemReturning } from '@/api/backend/items/ItemReturning';
import { ItemReturnPending } from '@/api/backend/items/ItemReturnPending';
import { bfs, StatusFlow } from '@/StatusFlow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Button,
  Chip,
  colors,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';

import { type FormSchemaType } from './ItemForm';

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
                renderValue={(v) => <Chip label={ITEM_STATUS_DATA.find(({ value }) => value === v)?.message} />}
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                {ITEM_STATUS_DATA.map((type) => (
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
      <Box mt={2}>
        <StatusFlowUI item={item} />
      </Box>
    </Card>
  );
}

function NotImplemented() {
  return (
    <Box sx={{ color: colors.grey[600], bgcolor: colors.grey[100], px: 2, py: 0.5 }}>
      <Typography variant="body2">尚未實作</Typography>
    </Box>
  );
}

function StatusFlowUI({ item }: { item: Item }) {
  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useFormContext<FormSchemaType>();

  const statusFlowWithAdminActions = StatusFlow.withActions('admin', {
    SubmitAppraisalStatus: (
      <HavePermissionsOnly permissionKeys={['ItemAppraisalReview']}>
        <RejectBtn
          text="審核失敗"
          popoverTitle="標記為審核失敗"
          onConfirm={async () => {
            const res = await ItemAppraisalReview(item.id, { action: 'reject' });
            if (res.error) {
              enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
              return;
            }
            enqueueSnackbar('已將物品標記為審核失敗', { variant: 'success' });
          }}
        />
        <ApproveBtn
          text="審核通過"
          popoverTitle="標記為審核通過"
          onConfirm={async () => {
            if (item.type === 0) {
              setError('type', { message: '請選擇物品類型' });
              return;
            }
            const res = await ItemAppraisalReview(item.id, { action: 'approve' });
            if (res.error) {
              enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
              return;
            }
            enqueueSnackbar('已將物品標記為審核成功', { variant: 'success' });
          }}
        />
      </HavePermissionsOnly>
    ),
    ConsignorShippedItem: (
      <HavePermissionsOnly permissionKeys={['ItemArrival']}>
        <ApproveBtn
          text="到貨"
          popoverTitle="標記為到貨"
          onConfirm={async () => {
            const res = await ItemArrival(item.id);
            if (res.error) {
              enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
              return;
            }
            enqueueSnackbar('已將物品標記為到貨', { variant: 'success' });
          }}
        />
      </HavePermissionsOnly>
    ),
    WarehouseReturnPendingStatus: (
      <HavePermissionsOnly permissionKeys={['ItemReturning']}>
        <ApproveBtn
          text="退貨中"
          popoverTitle="標記為退貨中"
          onConfirm={async () => {
            const res = await ItemReturning(item.id);
            if (res.error) {
              enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
              return;
            }
            enqueueSnackbar('已將物品標記為退貨中', { variant: 'success' });
          }}
        />
      </HavePermissionsOnly>
    ),
    WarehouseReturningStatus: (
      <HavePermissionsOnly permissionKeys={['ItemReturned']}>
        <ApproveBtn
          text="已退回"
          popoverTitle="標記為已退回"
          onConfirm={async () => {
            const res = await ItemReturned(item.id);
            if (res.error) {
              enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
              return;
            }
            enqueueSnackbar('已將物品標記為已退回', { variant: 'success' });
          }}
        />
      </HavePermissionsOnly>
    ),
    WarehouseArrivalStatus: (
      <>
        <HavePermissionsOnly permissionKeys={['ItemReturnPending']}>
          <RejectBtn
            text="準備退貨"
            popoverTitle="標記為準備退貨"
            onConfirm={async () => {
              const res = await ItemReturnPending(item.id);
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為準備退貨', { variant: 'success' });
            }}
          />
        </HavePermissionsOnly>

        <HavePermissionsOnly permissionKeys={['ItemCompleteDetails']}>
          <ApproveBtn
            text="檢查完成"
            popoverTitle="標記為檢查完成"
            onConfirm={async () => {
              const res = await ItemCompleteDetails(item.id);
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為檢查完成', { variant: 'success' });
            }}
          />
        </HavePermissionsOnly>
      </>
    ),
    ConsignorChoosesCompanyDirectPurchaseStatus: <NotImplemented />,
    ConsignorConfirmedStatus: <NotImplemented />,
    WarehousePersonnelConfirmedStatus: <NotImplemented />,
    BiddingStatus: null,
  });

  if (process.env.NODE_ENV === 'development') {
    if (Object.keys(statusFlowWithAdminActions).length !== ITEM_STATUS_DATA.length) {
      const missing = ITEM_STATUS_DATA.map((s) => s.key).filter(
        (s) => !Object.keys(statusFlowWithAdminActions).includes(s)
      );
      console.error(`Steps length mismatch, missing: ${missing.join(', ')}`);
    }
  }

  const path = bfs(
    Object.values(statusFlowWithAdminActions).map((v) => ({ value: v.status, next: v.next })),
    'SubmitAppraisalStatus',
    ITEM_STATUS_KEY_MAP[item.status]
  );

  if (!path) {
    return null;
  }

  // fill with happy path
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const last = path[path.length - 1];
    const step = statusFlowWithAdminActions[last];
    const happyNext = 'next' in step && step.next?.[0];
    if (!happyNext) break;
    path.push(happyNext);
  }

  const result = path.map((status) => {
    const step = statusFlowWithAdminActions[status];
    const active = ITEM_STATUS_MAP[step.status] === item.status;
    return (
      <StatusStep key={step.status} text={ITEM_STATUS_MESSAGE_MAP[step.status]} active={active}>
        {active && 'actions' in step && step.actions}
      </StatusStep>
    );
  });

  // inject fake step --------------
  // const i = result.findIndex(({ key }) => key === 'ConsignmentApprovedStatus');
  // if (i !== -1) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //   const active = result[i + 2].props.active;
  //   result.splice(i + 1, 0, <StatusStep key="fake" text="已到貨" active={active} />);
  // }
  // -------------------------------

  return result;
}

function StatusStep({ text, children, active }: { text: string; children?: React.ReactNode; active: boolean }) {
  return (
    <Stack
      direction="row"
      alignItems="start"
      position="relative"
      spacing={1.5}
      sx={{
        pb: 2,
        '&[data-active]~[data-status-step]': {
          '--color': 'var(--mui-palette-grey-400)',
        },
        '&[data-active], &[data-active]~[data-status-step]': {
          '--tail-color': 'var(--mui-palette-grey-400)',
        },
        '&:last-of-type': { '[data-tail]': { display: 'none' } },
      }}
      data-status-step
      data-active={active ? true : undefined}
    >
      <Box
        data-tail
        sx={{
          position: 'absolute',
          top: 8,
          left: 4,
          right: 0,
          height: '100%',
          width: 2,
          bgcolor: 'var(--tail-color, var(--mui-palette-primary-main))',
        }}
      />
      <Stack height={21} justifyContent="center" position="relative">
        <Box
          sx={{
            width: 10,
            height: 10,
            bgcolor: 'var(--color, var(--mui-palette-primary-main))',
            borderRadius: '50%',
          }}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography
          variant="body2"
          sx={{ color: active ? 'var(--mui-palette-text-primary)' : 'var(--mui-palette-grey-600)' }}
        >
          {text}
        </Typography>

        {children && (
          <Stack direction="row" spacing={2} justifyContent="end">
            {children}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

function RejectBtn({ text, popoverTitle, onConfirm }: { text: string; popoverTitle: string; onConfirm: () => void }) {
  const {
    formState: { isDirty },
  } = useFormContext();
  const popupState = usePopupState({
    variant: 'popover',
  });

  return (
    <>
      <Button
        {...bindTrigger(popupState)}
        type="submit"
        size="small"
        color="error"
        variant="outlined"
        disabled={isDirty}
      >
        {text}
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title={popoverTitle}
        onConfirm={onConfirm}
        onCancel={popupState.close}
      />
    </>
  );
}

function ApproveBtn({
  text,
  popoverTitle,
  onConfirm,
}: {
  text: string;
  popoverTitle: string;
  onConfirm: () => void | Promise<void>;
}) {
  const {
    formState: { isDirty },
  } = useFormContext();
  const popupState = usePopupState({
    variant: 'popover',
  });

  return (
    <>
      <Button {...bindTrigger(popupState)} type="submit" size="small" variant="contained" disabled={isDirty}>
        {text}
      </Button>
      <DoubleCheckPopover
        {...bindPopover(popupState)}
        title={popoverTitle}
        onConfirm={async () => {
          await onConfirm();
          popupState.close();
        }}
        onCancel={popupState.close}
      />
    </>
  );
}

function ReadyStatusHandleButtons({ item }: { item: Item }) {
  const { enqueueSnackbar } = useSnackbar();
  const [auctionID, setAuctionID] = useState('');
  const [error, setError] = useState('');

  return (
    <HavePermissionsOnly permissionKeys={['ItemBidding']}>
      <Stack spacing={1} mt={0.5}>
        <FormControl error={!!error}>
          <TextField
            size="small"
            label="日拍物品代碼"
            value={auctionID}
            onChange={(e) => setAuctionID(e.target.value)}
          />
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
        <ApproveBtn
          text="上架"
          popoverTitle="標記為上架"
          onConfirm={async () => {
            setError('');
            if (!auctionID) return;
            const res = await ItemBidding(item.id, { auctionID });
            if (res.error === '1025') {
              setError('日拍ID不能重複');
              return;
            }
            if (res.error) {
              enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
              return;
            }
            enqueueSnackbar('已將物品標記為上架', { variant: 'success' });
          }}
        />
      </Stack>
    </HavePermissionsOnly>
  );
}
