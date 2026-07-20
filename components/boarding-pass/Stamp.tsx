import { cn } from '@/lib/utils/cn'

/** 확정 도장. 반투명 잉크에 살짝 기울어진 각. */
export function Stamp({
  label,
  className,
  isAnimated = false,
}: {
  label: string
  className?: string
  isAnimated?: boolean
}) {
  return (
    <span
      className={cn(
        'border-pass-stamp text-pass-stamp pointer-events-none inline-block border-4 px-3 py-1 font-mono text-lg font-bold tracking-widest',
        isAnimated ? 'animate-stamp opacity-0' : 'rotate-[-8deg] opacity-85',
        className,
      )}
    >
      {label}
    </span>
  )
}
