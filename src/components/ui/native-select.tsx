import type * as React from 'react';

import { cn } from '@/lib/utils';

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot='native-select'
      className={cn(
        'border-input bg-background text-foreground inline-flex h-9 w-full cursor-pointer appearance-none rounded-md border bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat px-3 py-1 pr-8 text-sm shadow-xs transition-[color,box-shadow] outline-none',
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className
      )}
      {...props}
    />
  );
}

function NativeSelectOption(props: React.ComponentProps<'option'>) {
  return <option data-slot='native-select-option' {...props} />;
}

function NativeSelectOptGroup(props: React.ComponentProps<'optgroup'>) {
  return <optgroup data-slot='native-select-optgroup' {...props} />;
}

export { NativeSelect, NativeSelectOption, NativeSelectOptGroup };
