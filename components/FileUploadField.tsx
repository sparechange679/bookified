'use client';

import { useRef } from 'react';
import { FieldValues } from 'react-hook-form';
import { X } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FileUploadFieldProps } from '@/types';

const FileUploadField = <T extends FieldValues>({
  control,
  name,
  label,
  acceptTypes,
  disabled,
  icon: Icon,
  placeholder,
  hint,
}: FileUploadFieldProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const file = field.value as File | undefined;

        const openPicker = () => {
          if (!disabled) inputRef.current?.click();
        };

        const removeFile = (event: React.MouseEvent) => {
          event.stopPropagation();
          field.onChange(undefined);
          if (inputRef.current) inputRef.current.value = '';
        };

        return (
          <FormItem>
            <FormLabel className="form-label">{label}</FormLabel>

            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              onClick={openPicker}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPicker();
                }
              }}
              className={cn(
                'upload-dropzone border-2 border-dashed border-[var(--border-medium)] outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#663820]/40',
                file && 'upload-dropzone-uploaded border-[#663820]/40',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <FormControl>
                <input
                  ref={inputRef}
                  type="file"
                  accept={acceptTypes.join(',')}
                  className="hidden"
                  disabled={disabled}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.files?.[0]);
                  }}
                />
              </FormControl>

              {file ? (
                <div className="flex items-center gap-2 px-4">
                  <p className="upload-dropzone-text max-w-[260px] truncate sm:max-w-md">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={disabled}
                    className="upload-dropzone-remove"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Icon className="upload-dropzone-icon" />
                  <p className="upload-dropzone-text">{placeholder}</p>
                  <p className="upload-dropzone-hint">{hint}</p>
                </>
              )}
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default FileUploadField;
