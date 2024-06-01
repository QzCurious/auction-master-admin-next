import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TablePagination } from '@mui/material';

export default function SearchParamsTablePagination({ count }: { count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 20, 30]}
      component="div"
      count={count}
      rowsPerPage={Number(searchParams.get('rowsPerPage') ?? 10)}
      page={Number(searchParams.get('page') ?? 0)}
      onPageChange={(_, newPage) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', newPage.toString());
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }}
      onRowsPerPageChange={(event) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('rowsPerPage', event.target.value);
        newSearchParams.set('page', '0');
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }}
    />
  );
}
