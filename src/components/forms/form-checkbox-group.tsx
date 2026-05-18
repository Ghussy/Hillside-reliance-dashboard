'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type {
  BaseFormFieldProps,
  CheckboxGroupOption
} from '@/types/base-form';
import { cn } from '@/lib/utils';

interface FormCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: CheckboxGroupOption[];
  showBadges?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

function FormCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  required,
  options,
  showBadges = true,
  columns = 2,
  disabled,
  className
}: FormCheckboxGroupProps<TFieldValues, TName>) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='ml-1 text-red-500'>*</span>}
            </FormLabel>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <div className={`grid gap-3 sm:gap-4 ${gridCols[columns]}`}>
            {options.map((option) => (
              <label
                key={option.value}
                htmlFor={`${name}-${option.value}`}
                className={cn(
                  'bg-background hover:bg-accent/50 flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 text-base leading-snug font-medium transition-colors sm:min-h-12 sm:p-3 sm:text-sm',
                  (disabled || option.disabled) &&
                    'hover:bg-background cursor-not-allowed opacity-50'
                )}
              >
                <FormControl>
                  <Checkbox
                    id={`${name}-${option.value}`}
                    checked={field.value?.includes(option.value) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = field.value || [];
                      if (checked) {
                        field.onChange([...currentValues, option.value]);
                      } else {
                        field.onChange(
                          currentValues.filter(
                            (value: string) => value !== option.value
                          )
                        );
                      }
                    }}
                    disabled={disabled || option.disabled}
                  />
                </FormControl>
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {showBadges && field.value && field.value.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {field.value.map((value: string) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <Badge key={value} variant='secondary'>
                    {option?.label || value}
                  </Badge>
                );
              })}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormCheckboxGroup, type CheckboxGroupOption };
