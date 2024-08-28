'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuctionItemConsignorFeePaid } from '@/api/backend/auction-items/AuctionItemConsignorFeePaid';
import { GetAuctionItemQueryOptions } from '@/api/backend/auction-items/GetAuctionItem.query';
import { Button, Drawer, Stack, Typography } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { useSnackbar } from 'notistack';
import { type z } from 'zod';

import { pickedItemIdsReducerAtom, PickingList } from './PickingList';
import { type SearchParamsSchema } from './SearchParamsSchema';

export function PickForFeePaidButtons({
  picking,
  stage,
}: Pick<z.output<typeof SearchParamsSchema>, 'picking' | 'stage'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickedItemIds, dispatch] = useAtom(pickedItemIdsReducerAtom);

  return (
    <Stack direction="row" spacing={1}>
      {!picking && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('picking', 'fee');
            newSearchParams.set('stage', 'picking');
            router.replace(`?${newSearchParams}`);
          }}
        >
          付清手續費
        </Button>
      )}
      {picking === 'fee' && stage === 'picking' && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="error"
          onClick={() => {
            dispatch({ type: 'clear' });
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('picking');
            newSearchParams.delete('stage');
            router.replace(`?${newSearchParams}`);
          }}
        >
          取消選取
        </Button>
      )}
      {picking === 'fee' && stage === 'picking' && pickedItemIds.length > 0 && (
        <Button
          type="button"
          size="small"
          variant="contained"
          onClick={() => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('stage', 'checking');
            router.replace(`?${newSearchParams}`);
          }}
        >
          確認付清手續費
        </Button>
      )}
    </Stack>
  );
}

export function PickForFeePaid({ picking, stage }: Pick<z.output<typeof SearchParamsSchema>, 'picking' | 'stage'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItemIds = useAtomValue(pickedItemIdsReducerAtom);

  return (
    <Drawer
      PaperProps={{ sx: { width: 360 } }}
      anchor="right"
      open={picking === 'fee' && stage === 'checking' && pickedItemIds.length > 0}
      onClose={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('stage', 'picking');
        router.replace(`?${newSearchParams}`);
      }}
    >
      <Stack sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
        <PickingList />
        <FeeForm />
      </Stack>
    </Drawer>
  );
}

function FeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickedItemIds = useAtomValue(pickedItemIdsReducerAtom);
  const auctionItemQueries = useQueries({
    queries: pickedItemIds.map(GetAuctionItemQueryOptions),
    combine: (queries) => {
      if (queries.some((q) => q.isPending)) {
        return { isPending: true } as const;
      }
      if (queries.some((q) => q.isError) || queries.some((q) => q.data?.error)) {
        return { isError: true } as const;
      }
      return {
        length: queries.length,
      } as const;
    },
  });

  const { enqueueSnackbar } = useSnackbar();
  const [isPending, startTransition] = useTransition();

  if (auctionItemQueries.isPending || auctionItemQueries.isError) return;

  return (
    <Stack
      component="form"
      p={2}
      spacing={2}
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await AuctionItemConsignorFeePaid({ id: pickedItemIds });

          if (res.error) {
            enqueueSnackbar(res.error, { variant: 'error' });
            return;
          }

          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('picking');
          newSearchParams.delete('stage');
          router.replace(`?${newSearchParams}`);
          enqueueSnackbar('已標記為付清手續費', { variant: 'success' });
        });
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body1">共 {auctionItemQueries.length} 筆</Typography>

        <Button type="submit" variant="contained" disabled={isPending}>
          已付清手續費
        </Button>
      </Stack>
    </Stack>
  );
}
