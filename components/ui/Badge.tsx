import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/** 중립 프리미티브. 색은 호출부가 준다. */
export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  )
}
