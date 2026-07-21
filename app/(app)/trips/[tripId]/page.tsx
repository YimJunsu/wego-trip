import { notFound } from 'next/navigation'
import { CopyCodeButton } from '@/components/dashboard/CopyCodeButton'
import { ThemeBadge } from '@/components/dashboard/ThemeBadge'
import { TripDetailTabs } from '@/components/dashboard/TripDetailTabs'
import { parseDataState, settlementRepo, tripRepo } from '@/lib/data'
import { requireUser } from '@/lib/auth/session'
import type { PageProps } from '@/lib/types/page'
import { formatDateRange, formatDday, formatNights } from '@/lib/utils/format'

export default async function TripDetailPage({
  params,
  searchParams,
}: PageProps<{ tripId: string }>) {
  await requireUser()

  const { tripId } = await params
  const { state } = await searchParams
  const opts = { state: parseDataState(state) }

  const trip = await tripRepo.get(tripId, opts)
  if (!trip) notFound()

  const [members, settlements] = await Promise.all([
    tripRepo.listMembers(tripId, opts),
    settlementRepo.listByTrip(tripId, opts),
  ])

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-card border-line bg-surface shadow-soft border p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted font-mono text-xs tracking-widest">
              {trip.region}
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
              {trip.name}
            </h1>
          </div>
          <ThemeBadge theme={trip.coverTheme} />
        </div>

        <p className="text-muted mt-3 font-mono text-sm">
          {formatDateRange(trip.startDate, trip.endDate)} ·{' '}
          {formatNights(trip.startDate, trip.endDate)} ·{' '}
          {formatDday(trip.startDate, new Date())}
        </p>

        <div className="rounded-inner bg-paper mt-5 flex items-center gap-3 p-3 pl-4">
          <span className="text-muted font-mono text-xs tracking-widest">
            코드
          </span>
          <span className="font-display flex-1 font-semibold tracking-[0.2em]">
            {trip.inviteCode}
          </span>
          <CopyCodeButton code={trip.inviteCode} />
        </div>
      </header>

      <TripDetailTabs trip={trip} members={members} settlements={settlements} />
    </div>
  )
}
