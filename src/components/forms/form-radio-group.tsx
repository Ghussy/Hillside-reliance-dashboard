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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { BaseFormFieldProps, RadioGroupOption } from '@/types/base-form';
import { cn } from '@/lib/utils';

interface FormRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: RadioGroupOption[];
  orientation?: 'horizontal' | 'vertical';
}

function FormRadioGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  required,
  options,
  orientation = 'vertical',
  disabled,
  className
}: FormRadioGroupProps<TFieldValues, TName>) {
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
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
              className={
                orientation === 'horizontal'
                  ? 'grid gap-3 sm:grid-cols-2'
                  : 'grid gap-3'
              }
            >
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
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                    disabled={option.disabled}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormRadioGroup, type RadioGroupOption };
