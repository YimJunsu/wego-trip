import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr'
import { SettlePanel } from '@/components/dashboard/SettlePanel'
import {
  expenseRepo,
  parseDataState,
  settlementRepo,
  tripRepo,
} from '@/lib/data'
import { requireMemberPage } from '@/lib/auth/session'
import type { PageProps } from '@/lib/types/page'

export default async function SettlePage({
  params,
  searchParams,
}: PageProps<{ tripId: string }>) {
  const { tripId } = await params
  await requireMemberPage(tripId)

  const { state } = await searchParams
  const opts = { state: parseDataState(state) }

  const trip = await tripRepo.get(tripId, opts)
  if (!trip) notFound()

  const [expenses, settlements, members] = await Promise.all([
    expenseRepo.listByTrip(tripId, opts),
    settlementRepo.listByTrip(tripId, opts),
    tripRepo.listMembers(tripId, opts),
  ])

  const driverName = members.find((m) => m.isDriver)?.displayName

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href={`/trips/${tripId}`}
          className="text-muted hover:text-ink inline-flex items-center gap-1 font-mono text-xs tracking-widest"
        >
          <CaretLeftIcon size={12} weight="bold" aria-hidden />
          {trip.name}
        </Link>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
          정산
        </h1>
      </header>

      <SettlePanel
        tripId={tripId}
        members={members}
        initialExpenses={expenses}
        settlements={settlements}
        driverName={driverName}
      />
    </div>
  )
}
