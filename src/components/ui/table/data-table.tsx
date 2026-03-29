import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  pageSizeOptions?: number[];
}

export function DataTable<TData>({
  table,
  actionBar,
  children,
  pageSizeOptions
}: DataTableProps<TData>) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {children}
      <div className='relative flex min-h-0 flex-1'>
        <div className='absolute inset-0 overflow-auto rounded-lg border'>
          {/*
            Use a native <table> (not <Table>) so the wrapper div does not add
            overflow-x-auto, which breaks position:sticky on thead.
            Radix ScrollArea also breaks sticky; overflow-auto is the scroll container.
          */}
          <table className='w-full caption-bottom text-sm'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const pin = getCommonPinningStyles({
                      column: header.column
                    });
                    const pinned = header.column.getIsPinned();
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          'bg-muted sticky top-0 border-b',
                          pinned && 'z-20'
                        )}
                        style={{
                          ...pin,
                          position: 'sticky',
                          top: 0,
                          zIndex: pinned ? 20 : 10,
                          background: 'var(--color-muted)'
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column })
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
