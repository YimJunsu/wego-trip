import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * 티켓 본체. 좌우 절취 노치는 페이지 배경(paper)색 원을 반쯤 걸쳐 뚫린 것처럼 보이게 한다.
 * 브루탈리즘 요소(원색 블록·하드 섀도)를 여기에 섞지 않는다. (DESIGN_SYSTEM §3)
 */
export function PassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-pass-line bg-pass-cream text-pass-navy rounded-pass relative overflow-hidden border font-mono',
        className,
      )}
    >
      <Notch className="-left-3" />
      <Notch className="-right-3" />
      {children}
    </div>
  )
}

function Notch({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-paper border-pass-line absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border',
        className,
      )}
    />
  )
}

/** 절취선. 노치 두 개를 잇는 점선. */
export function PassTear() {
  return <div className="border-pass-line my-4 border-t border-dashed" />
}
