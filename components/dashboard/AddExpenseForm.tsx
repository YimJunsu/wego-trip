'use client'

import { useState } from 'react'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { FilterChip } from '@/components/dashboard/FilterChip'
import { TextField } from '@/components/dashboard/TextField'
import { expenseRepo } from '@/lib/data'
import type { Expense, Member } from '@/lib/data/types'

const CATEGORIES = ['교통', '숙박', '식비', '카페', '간식', '기타'] as const

export function AddExpenseForm({
  tripId,
  members,
  onAdded,
  onCancel,
}: {
  tripId: string
  members: Member[]
  onAdded: (expense: Expense) => void
  onCancel: () => void
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState(members[0]?.userId ?? '')
  const [participantIds, setParticipantIds] = useState(
    members.map((m) => m.userId),
  )
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [error, setError] = useState<string>()

  function toggleParticipant(id: string) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const won = Number(amount)
    if (!description.trim()) return setError('뭘 샀는지 적어 주세요.')
    if (!Number.isFinite(won) || won <= 0)
      return setError('금액을 숫자로 넣어 주세요.')
    if (participantIds.length === 0) return setError('부담할 사람이 없습니다.')

    setError(undefined)
    onAdded(
      await expenseRepo.add({
        tripId,
        payerId,
        amount: Math.round(won),
        description,
        category,
        participantIds,
      }),
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-card border-line bg-surface shadow-soft animate-rise flex flex-col gap-5 border p-5"
    >
      <TextField
        label="뭘 샀나"
        placeholder="주문진 회센터 저녁"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        label="얼마"
        type="number"
        inputMode="numeric"
        placeholder="152000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={error}
      />

      <ChipGroup label="결제한 사람">
        {members.map((m) => (
          <FilterChip
            key={m.userId}
            label={m.displayName}
            isSelected={payerId === m.userId}
            onToggle={() => setPayerId(m.userId)}
          />
        ))}
      </ChipGroup>

      <ChipGroup label="나눠 낼 사람">
        {members.map((m) => (
          <FilterChip
            key={m.userId}
            label={m.displayName}
            isSelected={participantIds.includes(m.userId)}
            onToggle={() => toggleParticipant(m.userId)}
          />
        ))}
      </ChipGroup>

      <ChipGroup label="분류">
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            label={c}
            isSelected={category === c}
            onToggle={() => setCategory(c)}
          />
        ))}
      </ChipGroup>

      <div className="flex gap-3">
        <ActionButton type="submit" tone="lime" className="flex-1">
          넣기
        </ActionButton>
        <ActionButton type="button" tone="quiet" onClick={onCancel}>
          취소
        </ActionButton>
      </div>
    </form>
  )
}

function ChipGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="text-muted mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}
