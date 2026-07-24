'use client'

import { useId, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

/**
 * 생년월일 입력. 네이티브 <input type="date">의 달력은 생일에 맞지 않는다 —
 * 기본값이 올해라 30년을 거슬러 넘겨야 하고, 달력 모양은 브라우저가 정해 우리 화면과 따로 논다.
 * 년·월·일 선택으로 나누면 몇 번의 탭으로 끝나고 생김새도 우리가 갖는다.
 *
 * 서버로는 기존과 같은 이름(birthDate)의 YYYY-MM-DD 하나로 보낸다.
 */

const THIS_YEAR = new Date().getFullYear()
/** 만 14세 미만은 가입 대상이 아니라 위쪽을 잘랐다. 아래는 넉넉히 120년. */
const YEARS = Array.from({ length: 107 }, (_, i) => THIS_YEAR - 14 - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function daysIn(year: string, month: string): number {
  if (!year || !month) return 31
  // 0일은 이전 달의 마지막 날. 윤년도 이걸로 저절로 맞는다.
  return new Date(Number(year), Number(month), 0).getDate()
}

const SELECT =
  'bg-transparent text-ink w-full appearance-none py-1 pr-5 text-[15px] outline-none'

/**
 * appearance-none이 네이티브 화살표를 지우므로 직접 얹는다.
 * 화살표가 없으면 그냥 글자로 보여 누를 수 있다는 걸 알 수 없다.
 */
function Select({
  label,
  className,
  children,
  ...rest
}: {
  label: string
  className?: string
  children: ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <select aria-label={label} className={SELECT} {...rest}>
        {children}
      </select>
      <CaretDown
        size={12}
        weight="bold"
        aria-hidden
        className="text-muted pointer-events-none absolute right-0 shrink-0"
      />
    </div>
  )
}

export function BirthDateField({ error }: { error?: string }) {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const labelId = useId()
  const errorId = `${labelId}-error`

  const dayCount = useMemo(() => daysIn(year, month), [year, month])
  // 2월 30일처럼 달을 바꿔 사라진 날짜가 남아 있으면 서버에 틀린 값이 간다.
  const safeDay = Number(day) > dayCount ? '' : day

  const value =
    year && month && safeDay
      ? `${year}-${month.padStart(2, '0')}-${safeDay.padStart(2, '0')}`
      : ''

  return (
    <div className="flex flex-col gap-0.5">
      <span
        id={labelId}
        className="text-muted font-display text-xs font-semibold tracking-wide"
      >
        생년월일
      </span>

      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className="flex items-center gap-2"
      >
        <Select
          label="년"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="flex-[1.3]"
        >
          <option value="">년</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>

        <Select
          label="월"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="flex-1"
        >
          <option value="">월</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </Select>

        <Select
          label="일"
          value={safeDay}
          onChange={(e) => setDay(e.target.value)}
          className="flex-1"
        >
          <option value="">일</option>
          {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}일
            </option>
          ))}
        </Select>
      </div>

      <input type="hidden" name="birthDate" value={value} />

      {error ? (
        <p id={errorId} className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
