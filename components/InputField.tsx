'use client';

import { FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputFieldProps } from '@/types';

const InputField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
}: InputFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="form-label">{label}</FormLabel>
          <FormControl>
            <input
              {...field}
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              className="form-input border border-[var(--border-subtle)] shadow-soft-sm outline-none transition-shadow focus:border-[#663820] focus:ring-2 focus:ring-[#663820]/20 disabled:opacity-60"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InputField;
