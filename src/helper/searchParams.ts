import type React from 'react';
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { PAGE, ROWS_PER_PAGE } from '@/static';

export function useSearchField(field: string, opts: { removeEmpty?: boolean } = { removeEmpty: true }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(field);

  const onChange = (event: string | React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete(PAGE);

    const newValue = typeof event === 'string' ? event : event.target.value;
    if (opts.removeEmpty && !newValue) {
      newSearchParams.delete(field);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
      router.refresh();
    } else {
      newSearchParams.set(field, newValue);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  };

  const remove = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete(PAGE);
    newSearchParams.delete(field);

    router.replace(`${pathname}?${newSearchParams.toString()}`);
    router.refresh();
  };

  return [value, onChange, remove] as const;
}

export function hasSearchFields(searchParams: ReadonlyURLSearchParams) {
  return searchParams.size - Number(searchParams.has(ROWS_PER_PAGE)) - Number(searchParams.has(PAGE)) > 0;
}

export function clearSearchFields(searchParams: URLSearchParams) {
  const rowsPerPage = searchParams.get(ROWS_PER_PAGE);
  const newSearchParams = new URLSearchParams();
  if (rowsPerPage) {
    newSearchParams.set(ROWS_PER_PAGE, rowsPerPage);
  } else {
    newSearchParams.delete(ROWS_PER_PAGE);
  }
  return newSearchParams;
}
