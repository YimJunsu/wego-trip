import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * 중립 프리미티브. 시각 언어는 입히지 않는다 — 색·테두리는 dashboard/ 나 boarding-pass/ 가 준다.
 * 여기서 보장하는 건 type 기본값과 비활성 처리뿐이다.
 */
export function Button({
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...rest}
    />
  )
}
