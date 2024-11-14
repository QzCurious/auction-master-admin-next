'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { ConsignorSelect } from '@/domain/crud/ConsignorSelect';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { PAGE } from '@/domain/static/static';
import { useQuery } from '@tanstack/react-query';

import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'consignorId';

export function ConsignorFilter({ consignorId }: { consignorId?: Consignor['id'] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const havePermissions = useHavePermissions();
  const consignorQuery = useQuery({
    queryFn: () => AdminGetConsignor(consignorId!),
    queryKey: ['consignor', consignorId],
    enabled: !!consignorId,
  });

  if (!havePermissions(['AdminGetConsignor', 'AdminGetConsignors'])) {
    return null;
  }

  return (
    <FilterPopover
      label="寄售人暱稱"
      value={consignorId ? consignorQuery.data?.data?.nickname || '--' : null}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(PAGE);
        newSearchParams.delete(FIELD);
        router.replace(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <ConsignorSelect
          textFieldProps={{ size: 'small' }}
          sx={{ width: 215 }}
          value={consignorId ?? null}
          onChange={(id, consignor) => {
            if (!id || !consignor) return;

            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(PAGE);
            newSearchParams.set(FIELD, id.toString());
            router.replace(`?${newSearchParams}`);
            close();
          }}
        />
      )}
    </FilterPopover>
  );
}
