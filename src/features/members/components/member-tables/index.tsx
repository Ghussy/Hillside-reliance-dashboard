'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';

const MEMBERS_PER_PAGE_DEFAULT = 100;
const MEMBERS_PAGE_SIZE_OPTIONS = [100, 200, 300, 400, 500] as const;

interface MemberTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function MemberTable<TData, TValue>({
  data,
  totalItems,
  columns
}: MemberTableParams<TData, TValue>) {
  const [pageSize] = useQueryState(
    'perPage',
    parseAsInteger.withDefault(MEMBERS_PER_PAGE_DEFAULT)
  );
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500,
    initialState: {
      pagination: { pageIndex: 0, pageSize: MEMBERS_PER_PAGE_DEFAULT }
    }
  });

  return (
    <DataTable table={table} pageSizeOptions={[...MEMBERS_PAGE_SIZE_OPTIONS]}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
