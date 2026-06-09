'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import * as R from 'remeda';

import { PAGE } from '../static/static';

interface RemoveSearchBtnProps<T extends string> {
  fields: T[];
}

export default function RemoveSearchBtn<T extends string>({ fields }: RemoveSearchBtnProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (R.intersection(fields, [...searchParams.keys()]).length === 0) return null;

  return (
    <Button
      variant="text"
      size="small"
      LinkComponent={Link}
      onClick={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(PAGE);
        for (const field of fields) {
          newSearchParams.delete(field);
        }
        router.replace(`?${newSearchParams}`);
        router.refresh();
      }}
    >
      清除搜尋
    </Button>
  );
}
