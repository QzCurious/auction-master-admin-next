'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { PAGE } from '@/static';
import { useQuery } from '@tanstack/react-query';

import { useHavePermissions } from '@/contexts/UserContext';
import { ConsignorSelect } from '@/components/ConsignorSelect';
import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'consignor';

export function ConsignorFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const havePermissions = useHavePermissions();
  const consignorId = searchParams.get(FIELD) ? Number(searchParams.get(FIELD)) : null;
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
      field={FIELD}
      transform={() => consignorQuery.data?.data?.nickname || '--'}
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
          value={consignorId}
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
