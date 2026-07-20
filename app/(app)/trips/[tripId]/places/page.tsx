import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr'
import { PlacesPanel } from '@/components/dashboard/PlacesPanel'
import { parseDataState, placeRepo, tripRepo } from '@/lib/data'
import type { PageProps } from '@/lib/types/page'

export default async function PlacesPage({
  params,
  searchParams,
}: PageProps<{ tripId: string }>) {
  const { tripId } = await params
  const { state } = await searchParams
  const opts = { state: parseDataState(state) }

  const trip = await tripRepo.get(tripId, opts)
  if (!trip) notFound()

  const places = await placeRepo.listByTrip(tripId, opts)

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
          근처 맛집
        </h1>
        <p className="text-muted mt-1 text-sm">
          착한가격업소는 라임색 점입니다. 마음에 들면 찜해 두세요.
        </p>
      </header>

      <PlacesPanel tripId={tripId} initialPlaces={places} />
    </div>
  )
}
