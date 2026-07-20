'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

type Mode = 'dart' | 'slot'

const TABS: { mode: Mode; label: string }[] = [
  { mode: 'dart', label: '다트 던지기' },
  { mode: 'slot', label: '조건으로 뽑기' },
]

/**
 * 뽑기 방식 전환. 패널을 언마운트하지 않고 hidden으로 숨겨
 * 탭을 오가도 필터·결과 상태가 남아 있게 한다.
 */
export function RandomModeTabs({
  dartPanel,
  slotPanel,
}: {
  dartPanel: ReactNode
  slotPanel: ReactNode
}) {
  const [mode, setMode] = useState<Mode>('dart')

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-ink/5 flex rounded-full p-1" role="tablist">
        {TABS.map((tab) => (
          <Button
            key={tab.mode}
            role="tab"
            aria-selected={mode === tab.mode}
            onClick={() => setMode(tab.mode)}
            className={cn(
              'font-display flex-1 rounded-full py-2 text-sm font-semibold transition duration-200 ease-out',
              mode === tab.mode
                ? 'bg-surface shadow-soft'
                : 'text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div hidden={mode !== 'dart'}>{dartPanel}</div>
      <div hidden={mode !== 'slot'}>{slotPanel}</div>
    </div>
  )
}
