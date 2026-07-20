import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tone = 'surface' | 'lime' | 'ink'

const TONE: Record<Tone, string> = {
  surface: 'bg-surface border-line border',
  lime: 'bg-lime',
  ink: 'bg-ink text-paper',
}

export function Card({
  children,
  className,
  tone = 'surface',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  tone?: Tone
  as?: 'div' | 'article' | 'section' | 'li'
}) {
  return (
    <Tag className={cn('rounded-card shadow-soft p-6', TONE[tone], className)}>
      {children}
    </Tag>
  )
}

/** 섹션 위에 얹는 작은 라벨. 참고 이미지의 "Recently Added" 자리. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-muted mb-3 text-sm font-medium">{children}</p>
}
