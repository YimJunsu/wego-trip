import Link from 'next/link'
import { ForkKnifeIcon } from '@phosphor-icons/react/dist/ssr'
import { actionButtonClass } from '@/components/dashboard/ActionButton'
import type { Trip } from '@/lib/data/types'
import { listTripDays } from '@/lib/utils/days'
import { formatDate } from '@/lib/utils/format'

/**
 * 날짜별 빈 슬롯. 일정 항목 타입이 PROJECT_SPEC §3에 아직 없어서 담을 것이 없다.
 * 지금은 장소를 찜해 두는 곳으로 안내한다.
 */
export function DayPlanList({ trip }: { trip: Trip }) {
  const days = listTripDays(trip.startDate, trip.endDate)

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {days.map((day, i) => (
          <li
            key={day}
            style={{ animationDelay: `${i * 70}ms` }}
            className="rounded-card border-line bg-surface animate-rise border p-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display font-semibold tracking-tight">
                DAY {i + 1}
              </span>
              <span className="text-muted font-mono text-xs">
                {formatDate(day)}
              </span>
            </div>
            <div className="rounded-inner border-line text-muted mt-3 border border-dashed p-5 text-center text-sm">
              아직 담은 곳이 없습니다
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={`/trips/${trip.id}/places`}
        className={actionButtonClass({ tone: 'quiet', className: 'w-full' })}
      >
        <ForkKnifeIcon size={16} weight="bold" aria-hidden />
        근처 맛집 보러가기
      </Link>
    </div>
  )
}
