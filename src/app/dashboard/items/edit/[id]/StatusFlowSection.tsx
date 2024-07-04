'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  ITEM_STATUS_DATA,
  ITEM_STATUS_KEY_MAP,
  ITEM_STATUS_MAP,
  ITEM_STATUS_MESSAGE_MAP,
} from '@/api/backend/configs.data';
import { type Item } from '@/api/backend/items/getItem';
import { itemArrival } from '@/api/backend/items/itemArrival';
import { itemCompleteDetails } from '@/api/backend/items/itemCompleteDetails';
import { itemReturnPending } from '@/api/backend/items/itemReturnPending';
import { reviewItem } from '@/api/backend/items/reviewItem';
import { updateItem } from '@/api/backend/items/updateItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button, Chip, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';
import { useFormContext } from 'react-hook-form';
import { type z } from 'zod';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';

import { type FormSchema } from './ItemForm';

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
                <MenuItem key={type.value} value={type.value}>
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
              const res = await updateItem(item.id, { status });
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                setShowMore(false);
                return;
              }
              enqueueSnackbar('已更新物品狀態', { variant: 'success' });
              setShowMore(false);
              popupState.close();
            }}
          />
        </Stack>
      )}

      <Box mt={2}>
        <StatusFlow item={item} />
      </Box>
    </Card>
  );
}

type Step =
  | {
      status: keyof typeof ITEM_STATUS_MAP;
      next?: never;
      actions?: never;
    }
  | {
      status: keyof typeof ITEM_STATUS_MAP;
      next: [keyof typeof ITEM_STATUS_MAP, ...Array<keyof typeof ITEM_STATUS_MAP>];
      actions?: React.ReactNode;
    };

function StatusFlow({ item }: { item: Item }) {
  const { enqueueSnackbar } = useSnackbar();

  // 要從 flowchart 的 root 依序排到 leaf; happy path 要排在 next 的最前面
  const steps: Record<keyof typeof ITEM_STATUS_MAP, Step> = {
    SubmitAppraisalStatus: {
      status: 'SubmitAppraisalStatus',
      next: ['AppraisedStatus', 'AppraisalFailureStatus'],
      actions: (
        <>
          <RejectBtn
            text="審核失敗"
            popoverTitle="標記為審核失敗"
            onConfirm={async () => {
              const res = await reviewItem(item.id, { action: 'reject' });
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
              const res = await reviewItem(item.id, { action: 'approve' });
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為審核成功', { variant: 'success' });
            }}
          />
        </>
      ),
    },
    AppraisalFailureStatus: {
      status: 'AppraisalFailureStatus',
    },
    AppraisedStatus: {
      status: 'AppraisedStatus',
      next: ['ConsignmentApprovedStatus', 'ConsignmentCanceledStatus'],
    },
    ConsignmentCanceledStatus: {
      status: 'ConsignmentCanceledStatus',
    },
    ConsignmentApprovedStatus: {
      status: 'ConsignmentApprovedStatus',
      next: ['WarehouseArrivalStatus', 'WarehouseReturnPendingStatus'],
      actions: (
        <>
          <RejectBtn
            text="退貨"
            popoverTitle="標記為退貨"
            onConfirm={async () => {
              const res = await itemArrival(item.id, { action: 'reject' });
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為退貨', { variant: 'success' });
            }}
          />
          <ApproveBtn
            text="到貨"
            popoverTitle="標記為到貨"
            onConfirm={async () => {
              const res = await itemArrival(item.id, { action: 'approve' });
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為到貨', { variant: 'success' });
            }}
          />
        </>
      ),
    },
    WarehouseReturnPendingStatus: {
      status: 'WarehouseReturnPendingStatus',
      next: ['WarehouseReturningStatus'],
    },
    WarehouseReturningStatus: {
      status: 'WarehouseReturningStatus',
      next: ['ReturnedStatus'],
    },
    ReturnedStatus: {
      status: 'ReturnedStatus',
    },
    WarehouseArrivalStatus: {
      status: 'WarehouseArrivalStatus',
      next: ['DetailsFullyCompletedStatus', 'WarehouseReturnPendingStatus'],
      actions: (
        <>
          <RejectBtn
            text="準備退貨"
            popoverTitle="標記為準備退貨"
            onConfirm={async () => {
              const res = await itemReturnPending(item.id);
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為準備退貨', { variant: 'success' });
            }}
          />

          <ApproveBtn
            text="檢查完成"
            popoverTitle="標記為檢查完成"
            onConfirm={async () => {
              const res = await itemCompleteDetails(item.id);
              if (res.error) {
                enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error', persist: true });
                return;
              }
              enqueueSnackbar('已將物品標記為檢查完成', { variant: 'success' });
            }}
          />
        </>
      ),
    },
    DetailsFullyCompletedStatus: {
      status: 'DetailsFullyCompletedStatus',
      next: ['ReadyStatus', 'WarehouseReturnPendingStatus'],
    },
    ReadyStatus: {
      status: 'ReadyStatus',
      next: ['BiddingStatus', 'CompanyReclaimedStatus'],
    },
    CompanyReclaimedStatus: {
      status: 'CompanyReclaimedStatus',
    },
    BiddingStatus: {
      status: 'BiddingStatus',
      next: ['SoldStatus', 'CompanyRepurchasedStatus', 'ReadyStatus'],
    },
    CompanyRepurchasedStatus: {
      status: 'CompanyRepurchasedStatus',
    },
    SoldStatus: {
      status: 'SoldStatus',
    },
  };

  if (process.env.NODE_ENV === 'development') {
    if (Object.keys(steps).length !== ITEM_STATUS_DATA.length) {
      const missing = ITEM_STATUS_DATA.map((s) => s.key).filter((s) => !Object.keys(steps).includes(s));
      console.error(`Steps length mismatch, missing: ${missing.join(', ')}`);
    }
  }

  function getTravelPath(start: keyof typeof steps, end: keyof typeof steps, visited = new Set<keyof typeof steps>()): Array<keyof typeof steps> {
    if (visited.has(start)) return [];
    visited.add(start);

    if (!steps[start].next) return [];
    if (start === end) return [start];
    if (steps[start].next.includes(end)) return [start, end];
    for (const each of steps[start].next) {
      const path = getTravelPath(each, end, visited);
      if (path.length > 1) return [start, ...path];
    }
    return [];
  }
  const path = getTravelPath('SubmitAppraisalStatus', ITEM_STATUS_KEY_MAP[item.status]);

  // fill with happy path
  if (path.length > 0) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const last = path[path.length - 1];
      const happyNext = steps[last].next?.[0];
      if (!happyNext) break;
      path.push(happyNext);
    }
  }

  return path.map((status) => {
    const step = steps[status];
    const active = ITEM_STATUS_MAP[step.status] === item.status;
    return (
      <StatusStep
        key={step.status}
        text={ITEM_STATUS_MESSAGE_MAP[step.status]}
        active={active}
        end={active && !step.next}
      >
        {active ? step.actions : null}
      </StatusStep>
    );
  });
}

function StatusStep({
  text,
  children,
  active,
  end,
}: {
  text: string;
  children?: React.ReactNode;
  active: boolean;
  end: boolean;
}) {
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
            bgcolor: end ? 'var(--mui-palette-grey-600)' : 'var(--color, var(--mui-palette-primary-main))',
            borderRadius: '50%',
          }}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography
          variant="body2"
          sx={{
            color: end || active ? 'var(--mui-palette-text-primary)' : 'var(--mui-palette-grey-600)',
          }}
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
  } = useFormContext<z.input<typeof FormSchema>>();
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
      <DoubleCheckPopover {...bindPopover(popupState)} title={popoverTitle} onConfirm={onConfirm} />
    </>
  );
}

function ApproveBtn({ text, popoverTitle, onConfirm }: { text: string; popoverTitle: string; onConfirm: () => void }) {
  const {
    formState: { isDirty },
  } = useFormContext<z.input<typeof FormSchema>>();
  const popupState = usePopupState({
    variant: 'popover',
  });

  return (
    <>
      <Button {...bindTrigger(popupState)} type="submit" size="small" variant="contained" disabled={isDirty}>
        {text}
      </Button>
      <DoubleCheckPopover {...bindPopover(popupState)} title={popoverTitle} onConfirm={onConfirm} />
    </>
  );
}
