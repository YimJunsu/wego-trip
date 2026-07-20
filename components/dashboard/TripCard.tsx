import Link from 'next/link'
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr'
import { ThemeBadge } from '@/components/dashboard/ThemeBadge'
import { AvatarStack } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Profile, Trip } from '@/lib/data/types'
import { formatDateRange, formatDday, formatNights } from '@/lib/utils/format'

export function TripCard({
  trip,
  members,
  today,
  index = 0,
}: {
  trip: Trip
  members: Profile[]
  today: Date
  /** 목록이 순서대로 올라오게 하는 지연값. */
  index?: number
}) {
  const dday = formatDday(trip.startDate, today)
  const isPast = dday === '지난 여행'

  return (
    <li style={{ animationDelay: `${index * 70}ms` }} className="animate-rise">
      <Link
        href={`/trips/${trip.id}`}
        className="rounded-card border-line bg-surface shadow-soft hover:shadow-lift block border p-6 transition duration-300 ease-out hover:-translate-y-[3px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">
              {trip.name}
            </h3>
            <p className="text-muted mt-1 text-sm">{trip.region}</p>
          </div>
          <Badge
            className={
              isPast
                ? 'bg-ink/5 text-muted font-mono'
                : 'bg-lime text-ink font-mono'
            }
          >
            {dday}
          </Badge>
        </div>

        <p className="text-muted mt-5 font-mono text-sm">
          {formatDateRange(trip.startDate, trip.endDate)} ·{' '}
          {formatNights(trip.startDate, trip.endDate)}
        </p>

        <div className="border-line mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <AvatarStack people={members} label="멤버" />
          <span className="flex items-center gap-2">
            <ThemeBadge theme={trip.coverTheme} />
            <ArrowUpRightIcon size={18} weight="bold" className="text-muted" />
          </span>
        </div>
      </Link>
    </li>
  )
}
