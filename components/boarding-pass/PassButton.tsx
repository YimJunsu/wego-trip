import type { ButtonHTMLAttributes } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

/** 보딩패스 갈래의 버튼. 원색 블록도, 하드 섀도도 쓰지 않는다. (DESIGN_SYSTEM §3) */
export function PassButton({
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={cn(
        'bg-pass-navy text-pass-cream rounded-pass px-5 py-3 font-mono text-sm tracking-widest transition hover:opacity-90',
        className,
      )}
      {...rest}
    />
  )
}
