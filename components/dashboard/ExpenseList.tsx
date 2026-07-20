import { ReceiptIcon } from '@phosphor-icons/react/dist/ssr'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Expense, Profile } from '@/lib/data/types'
import { formatWon } from '@/lib/utils/format'

export function ExpenseList({
  expenses,
  profiles,
}: {
  expenses: Expense[]
  profiles: Profile[]
}) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={ReceiptIcon}
        title="지출이 없습니다"
        description="누가 뭘 결제했는지 넣으면 정산이 시작됩니다."
      />
    )
  }

  return (
    <ul className="divide-line border-line bg-surface rounded-card divide-y border px-5">
      {expenses.map((expense) => {
        const payer = profiles.find((p) => p.id === expense.payerId)
        return (
          <li key={expense.id} className="flex items-center gap-3 py-4">
            <Avatar name={payer?.nickname ?? '?'} src={payer?.avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="font-display truncate font-medium">
                {expense.description}
              </p>
              <p className="text-muted mt-0.5 text-xs">
                {payer?.nickname} 결제 · {expense.participantIds.length}명 부담
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="font-mono font-semibold">
                {formatWon(expense.amount)}
              </p>
              <Badge className="bg-ink/5 text-muted">{expense.category}</Badge>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
