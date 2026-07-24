'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import { Field } from '@/components/ui/Field'
import { cn } from '@/lib/utils/cn'

/**
 * boxed: 미색 배경 위에 흰 입력칸이 하나씩 뜨는 기본형.
 * row:   흰 카드 안에서 구분선으로만 나뉘는 행. 입력칸이 여러 개 이어질 때
 *        같은 사각형이 반복돼 단조로워지는 걸 피한다. (DESIGN_SYSTEM §2 divide-line)
 */
type Variant = 'boxed' | 'row'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  hint?: string
  error?: string
  variant?: Variant
  /** 입력칸 오른쪽에 겹쳐 놓을 것 (표시 토글·상태 표시 등). */
  adornment?: ReactNode
}

const BASE =
  'w-full transition duration-200 ease-out outline-none placeholder:text-muted/50'

const BOXED =
  'rounded-inner bg-surface border px-4 py-3 focus:border-ink'

const ROW = 'bg-transparent border-0 px-0 py-1 text-[15px]'

export function TextField({
  label,
  hint,
  error,
  className,
  variant = 'boxed',
  adornment,
  ...rest
}: Props) {
  const isRow = variant === 'row'

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      className={isRow ? 'gap-0.5' : undefined}
      labelClassName={cn(
        'font-display font-medium',
        isRow && 'text-muted text-xs font-semibold tracking-wide',
      )}
      errorClassName="text-danger font-normal"
    >
      {(props) => (
        <div className={cn('relative flex items-center', adornment ? 'gap-2' : undefined)}>
          <input
            {...props}
            {...rest}
            className={cn(
              BASE,
              isRow ? ROW : cn(BOXED, error ? 'border-danger' : 'border-line'),
              className,
            )}
          />
          {adornment}
        </div>
      )}
    </Field>
  )
}
