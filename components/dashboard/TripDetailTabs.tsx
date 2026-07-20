'use client'

import { useState } from 'react'
import Link from 'next/link'
import { actionButtonClass } from '@/components/dashboard/ActionButton'
import { DayPlanList } from '@/components/dashboard/DayPlanList'
import { MemberList } from '@/components/dashboard/MemberList'
import { SettlementList } from '@/components/dashboard/SettlementList'
import { TabBar } from '@/components/dashboard/TabBar'
import type { Member, Profile, Settlement, Trip } from '@/lib/data/types'

type Tab = 'members' | 'plan' | 'settle'

const TABS = [
  { value: 'members', label: '멤버' },
  { value: 'plan', label: '일정' },
  { value: 'settle', label: '정산' },
] as const satisfies readonly { value: Tab; label: string }[]

export function TripDetailTabs({
  trip,
  members,
  profiles,
  settlements,
}: {
  trip: Trip
  members: Member[]
  profiles: Profile[]
  settlements: Settlement[]
}) {
  const [tab, setTab] = useState<Tab>('members')

  return (
    <div className="flex flex-col gap-4">
      <TabBar tabs={TABS} current={tab} onSelect={setTab} />

      <div role="tabpanel">
        {tab === 'members' ? (
          <MemberList members={members} profiles={profiles} />
        ) : tab === 'plan' ? (
          <DayPlanList trip={trip} />
        ) : (
          <div className="flex flex-col gap-4">
            <SettlementList settlements={settlements} profiles={profiles} />
            <Link
              href={`/trips/${trip.id}/settle`}
              className={actionButtonClass({
                tone: 'quiet',
                className: 'w-full',
              })}
            >
              정산 자세히 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
