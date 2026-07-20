'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { DataState } from '@/lib/data/repositories'

const STATES: { value: DataState | 'normal'; label: string }[] = [
  { value: 'normal', label: '정상' },
  { value: 'empty', label: '빈' },
  { value: 'loading', label: '로딩' },
  { value: 'error', label: '에러' },
]

/**
 * mock 전용 도구. 화면의 네 가지 상태를 클릭으로 오가며 확인한다.
 * 실데이터 전환 시 이 컴포넌트와 ?state= 파라미터를 함께 제거한다.
 */
export function MockStateBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('state') ?? 'normal'

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="border-line bg-surface/90 shadow-lift flex items-center gap-2 rounded-full border p-1.5 pl-4 backdrop-blur-md">
        <span className="text-muted font-mono text-[0.65rem] tracking-widest">
          MOCK
        </span>
        <ul className="flex gap-1">
          {STATES.map(({ value, label }) => {
            const href =
              value === 'normal' ? pathname : `${pathname}?state=${value}`
            const isActive = current === value
            return (
              <li key={value}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block rounded-full px-3 py-1 text-xs font-medium transition duration-200 ${
                    isActive ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
