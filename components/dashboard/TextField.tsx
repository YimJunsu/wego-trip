'use client'

import type { InputHTMLAttributes } from 'react'
import { Field } from '@/components/ui/Field'
import { cn } from '@/lib/utils/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  hint?: string
  error?: string
}

export function TextField({ label, hint, error, className, ...rest }: Props) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      labelClassName="font-display font-medium"
      errorClassName="text-danger font-normal"
    >
      {(props) => (
        <input
          {...props}
          {...rest}
          className={cn(
            'rounded-inner bg-surface w-full border px-4 py-3 transition duration-200 ease-out',
            'placeholder:text-muted/60 focus:border-ink outline-none',
            error ? 'border-danger' : 'border-line',
            className,
          )}
        />
      )}
    </Field>
  )
}
