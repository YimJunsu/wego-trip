'use client'

import { useActionState, useState } from 'react'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { FilterChip } from '@/components/dashboard/FilterChip'
import { TextField } from '@/components/dashboard/TextField'
import type { DestinationTheme } from '@/lib/data/types'
import { createTripAction, type TripFormState } from '@/lib/trips/actions'
import { THEME_LABEL, THEME_ORDER } from '@/lib/utils/labels'

const EMPTY: TripFormState = {}

export function NewTripForm() {
  const [state, formAction, isPending] = useActionState(createTripAction, EMPTY)
  const [coverTheme, setCoverTheme] = useState<DestinationTheme>('sea')
  const errors = state.errors ?? {}

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <TextField
        label="여행방 이름"
        name="name"
        placeholder="강릉 여름바다"
        error={errors.name}
      />
      <TextField
        label="지역"
        name="region"
        hint="국내만 됩니다."
        placeholder="강원 강릉"
        error={errors.region}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="출발"
          name="startDate"
          type="date"
          error={errors.startDate}
        />
        <TextField
          label="도착"
          name="endDate"
          type="date"
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
      {/* FilterChip은 버튼이라 폼 값이 되지 않는다. 선택값만 따로 실어 보낸다. */}
      <input type="hidden" name="coverTheme" value={coverTheme} />

      <ActionButton type="submit" tone="ink" size="lg" disabled={isPending}>
        {isPending ? '만드는 중…' : '여행방 만들기'}
      </ActionButton>
      <p className="text-muted text-xs">
        만들면 초대코드가 발급됩니다. 친구에게 코드만 알려주면 됩니다.
      </p>
    </form>
  )
}
