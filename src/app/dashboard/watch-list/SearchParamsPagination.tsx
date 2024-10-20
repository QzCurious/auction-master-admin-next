'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE, ROWS_PER_PAGE } from '@/domain/static/static';
import { TablePagination } from '@mui/material';
import { unique } from 'remeda';

import { SearchParamsSchema } from './SearchParamsSchema';

export function SearchParamsPagination({ count }: { count: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page, rowsPerPage } = SearchParamsSchema.parse(Object.fromEntries(searchParams));

  return (
    <TablePagination
      rowsPerPageOptions={unique([30, 50, 100]).sort((a, b) => a - b)}
      labelRowsPerPage="每頁顯示筆數"
      labelDisplayedRows={({ from, to, count }) => `${from} ~ ${to}, 共 ${count} 筆`}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(_, newPage) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(PAGE, newPage.toString());
        router.replace(`?${newSearchParams.toString()}`);
      }}
      onRowsPerPageChange={(event) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(ROWS_PER_PAGE, event.target.value);
        newSearchParams.delete(PAGE);
        router.replace(`?${newSearchParams.toString()}`);
      }}
    />
  );
}
