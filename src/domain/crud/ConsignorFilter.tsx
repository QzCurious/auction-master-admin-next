'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import { PAGE } from '@/domain/static/static';
import { useQuery } from '@tanstack/react-query';

import { ConsignorSelect } from '@/components/ConsignorSelect';
import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'consignorID';

export function ConsignorFilter({ consignorID }: { consignorID?: Consignor['id'] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const havePermissions = useHavePermissions();
  const consignorQuery = useQuery({
    queryFn: () => AdminGetConsignor(consignorID!),
    queryKey: ['consignor', consignorID],
    enabled: !!consignorID,
  });

  if (!havePermissions(['AdminGetConsignor', 'AdminGetConsignors'])) {
    return null;
  }

  return (
    <FilterPopover
      label="寄售人暱稱"
      value={consignorID ? consignorQuery.data?.data?.nickname || '--' : null}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FIELD);
        router.replace(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <ConsignorSelect
          textFieldProps={{ size: 'small' }}
          sx={{ width: 215 }}
          value={consignorID ?? null}
          onChange={(id, consignor) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(PAGE);
            if (!id || !consignor) return;

            newSearchParams.set(FIELD, id.toString());
            router.replace(`?${newSearchParams}`);
            close();
          }}
        />
      )}
    </FilterPopover>
  );
}
