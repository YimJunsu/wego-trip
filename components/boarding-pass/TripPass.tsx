import { PassCard, PassTear } from '@/components/boarding-pass/PassCard'
import { Stamp } from '@/components/boarding-pass/Stamp'
import type { Trip } from '@/lib/data/types'
import { formatDate, formatNights } from '@/lib/utils/format'

/** 여행권. 항공권 용어를 빌려 쓴다: FROM/TO, BOARDING, CODE. (DESIGN_SYSTEM §3) */
export function TripPass({
  trip,
  stampLabel,
  isStampAnimated = false,
}: {
  trip: Trip
  stampLabel?: string
  isStampAnimated?: boolean
}) {
  return (
    <PassCard className="p-6">
      <div className="flex justify-between text-xs tracking-widest">
        <span>FROM · 서울</span>
        <span>TO · {trip.region}</span>
      </div>

      <p className="mt-3 text-2xl">{trip.name}</p>

      <PassTear />

      <dl className="grid grid-cols-2 gap-4 text-xs tracking-widest">
        <div>
          <dt className="opacity-70">BOARDING</dt>
          <dd className="mt-1 text-sm">{formatDate(trip.startDate)}</dd>
        </div>
        <div>
          <dt className="opacity-70">DURATION</dt>
          <dd className="mt-1 text-sm">
            {formatNights(trip.startDate, trip.endDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest opacity-70">INVITE CODE</p>
          <p className="mt-1 text-3xl tracking-[0.3em]">{trip.inviteCode}</p>
        </div>
        {stampLabel ? (
          <Stamp label={stampLabel} isAnimated={isStampAnimated} />
        ) : null}
      </div>
    </PassCard>
  )
}
