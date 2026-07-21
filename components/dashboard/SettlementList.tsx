import { ArrowRightIcon, CalculatorIcon } from '@phosphor-icons/react/dist/ssr'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import type { Member, Settlement } from '@/lib/data/types'
import { formatWon } from '@/lib/utils/format'

/** "누가 누구에게 얼마". 계산은 여기서 하지 않는다 — 이미 계산된 목록을 받아 그리기만 한다. */
export function SettlementList({
  settlements,
  members,
}: {
  settlements: Settlement[]
  members: Member[]
}) {
  if (settlements.length === 0) {
    return (
      <EmptyState
        icon={CalculatorIcon}
        title="정산할 게 없습니다"
        description="지출을 넣으면 누가 누구에게 얼마를 보낼지 여기 나옵니다."
      />
    )
  }

  const nameOf = (id: string) =>
    members.find((m) => m.userId === id)?.displayName

  return (
    <ul className="flex flex-col gap-3">
      {settlements.map((s, i) => {
        const fromName = nameOf(s.from)
        const toName = nameOf(s.to)
        return (
          <li
            key={`${s.from}-${s.to}-${i}`}
            style={{ animationDelay: `${i * 70}ms` }}
            className="rounded-card border-line bg-surface animate-rise flex items-center gap-3 border p-4"
          >
            <Person name={fromName ?? '알 수 없음'} />
            <ArrowRightIcon
              size={16}
              weight="bold"
              className="text-muted shrink-0"
              aria-label="에게 보냄"
            />
            <Person name={toName ?? '알 수 없음'} />
            <span className="ml-auto font-mono font-semibold">
              {formatWon(s.amount)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Person({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2">
      <Avatar name={name} size="sm" />
      <span className="font-medium">{name}</span>
    </span>
  )
}
