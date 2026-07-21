'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ActionButton,
  actionButtonClass,
} from '@/components/dashboard/ActionButton'
import { FilterChip } from '@/components/dashboard/FilterChip'
import { TextField } from '@/components/dashboard/TextField'
import { createTrip } from '@/lib/trips/actions'
import type { DestinationTheme, Trip } from '@/lib/data/types'
import { formatDateRange } from '@/lib/utils/format'
import { THEME_LABEL, THEME_ORDER } from '@/lib/utils/labels'

type Errors = Partial<
  Record<'name' | 'region' | 'startDate' | 'endDate', string>
>

export function NewTripForm() {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coverTheme, setCoverTheme] = useState<DestinationTheme>('sea')
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<Trip | null>(null)

  function validate(): Errors {
    const next: Errors = {}
    if (!name.trim()) next.name = '이름은 있어야 합니다.'
    if (!region.trim()) next.region = '어디로 가는지는 정해야 합니다.'
    if (!startDate) next.startDate = '출발일을 고르세요.'
    if (!endDate) next.endDate = '돌아오는 날을 고르세요.'
    if (startDate && endDate && endDate < startDate) {
      next.endDate = '돌아오는 날이 출발일보다 빠릅니다.'
    }
    return next
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setIsSubmitting(true)
    setCreated(
      await createTrip({ name, region, startDate, endDate, coverTheme }),
    )
    setIsSubmitting(false)
  }

  if (created) return <CreatedPanel trip={created} />

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <TextField
        label="여행방 이름"
        placeholder="강릉 여름바다"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <TextField
        label="지역"
        hint="국내만 됩니다."
        placeholder="강원 강릉"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        error={errors.region}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="출발"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errors.startDate}
        />
        <TextField
          label="도착"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={errors.endDate}
        />
      </div>

      <fieldset>
        <legend className="text-muted mb-2 text-sm font-medium">
          커버 테마
        </legend>
        <div className="flex flex-wrap gap-2">
          {THEME_ORDER.map((theme) => (
            <FilterChip
              key={theme}
              label={THEME_LABEL[theme]}
              isSelected={coverTheme === theme}
              onToggle={() => setCoverTheme(theme)}
            />
          ))}
        </div>
      </fieldset>

      <ActionButton type="submit" tone="ink" size="lg" disabled={isSubmitting}>
        {isSubmitting ? '만드는 중…' : '여행방 만들기'}
      </ActionButton>
      <p className="text-muted text-xs">
        만들면 초대코드가 발급됩니다. 친구에게 코드만 알려주면 됩니다.
      </p>
    </form>
  )
}

function CreatedPanel({ trip }: { trip: Trip }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card bg-lime shadow-soft animate-rise p-7">
        <p className="font-display text-2xl font-semibold tracking-tight">
          방이 만들어졌습니다
        </p>
        <p className="mt-1 text-sm opacity-70">
          {trip.name} · {trip.region} ·{' '}
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>

        <div className="rounded-inner bg-surface mt-6 p-5 text-center">
          <p className="text-muted font-mono text-xs tracking-widest">
            초대코드
          </p>
          <p className="font-display mt-1 text-3xl font-semibold tracking-[0.25em]">
            {trip.inviteCode}
          </p>
        </div>
      </div>

      <p className="rounded-inner border-line text-muted border border-dashed p-4 text-xs leading-relaxed">
        MOCK · 방은 메모리에만 있습니다. 새로고침하면 사라지고, 여행방 목록에도
        안 보입니다. 실제 저장은 Supabase를 붙일 때 됩니다.
      </p>

      <Link href="/" className={actionButtonClass({ tone: 'quiet' })}>
        홈으로
      </Link>
    </div>
  )
}
