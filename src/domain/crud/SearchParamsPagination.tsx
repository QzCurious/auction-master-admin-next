'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE, ROWS_PER_PAGE, type PaginationSearchParams } from '@/domain/static/static';
import { TablePagination } from '@mui/material';
import { unique } from 'remeda';

export function SearchParamsPagination({
  rowsPerPage,
  page,
  rowsPerPageOptions,
  count,
}: {
  rowsPerPageOptions?: number[];
  count: number;
} & PaginationSearchParams) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <TablePagination
      rowsPerPageOptions={unique(rowsPerPageOptions ?? [rowsPerPage, 50, 100]).sort((a, b) => a - b)}
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
