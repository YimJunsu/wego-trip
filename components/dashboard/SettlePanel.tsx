'use client'

import { useState } from 'react'
import { PlusIcon } from '@phosphor-icons/react'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm'
import { ExpenseList } from '@/components/dashboard/ExpenseList'
import { SettlementList } from '@/components/dashboard/SettlementList'
import { AvatarStack } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Expense, Member, Settlement } from '@/lib/data/types'
import { formatWon } from '@/lib/utils/format'

export function SettlePanel({
  tripId,
  members,
  initialExpenses,
  settlements,
  driverName,
}: {
  tripId: string
  members: Member[]
  initialExpenses: Expense[]
  settlements: Settlement[]
  driverName?: string
}) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [isAdding, setIsAdding] = useState(false)

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-card bg-lime shadow-soft p-7">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-xs tracking-widest opacity-60">
            총 지출
          </p>
          <AvatarStack
            people={members.map((m) => ({ id: m.userId, name: m.displayName }))}
            label="함께 쓴 사람"
          />
        </div>
        <p className="font-display mt-2 text-4xl font-semibold tracking-tight">
          {formatWon(total)}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge className="bg-ink/8 text-ink">{expenses.length}건</Badge>
          <Badge className="bg-ink/8 text-ink">{members.length}명</Badge>
          {driverName ? (
            <Badge className="bg-ink text-paper">
              운전자 {driverName} 20% 할인
            </Badge>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            지출
          </h2>
          {!isAdding ? (
            <ActionButton size="sm" onClick={() => setIsAdding(true)}>
              <PlusIcon size={14} weight="bold" aria-hidden />
              지출 넣기
            </ActionButton>
          ) : null}
        </div>

        {isAdding ? (
          <div className="mb-4">
            <AddExpenseForm
              tripId={tripId}
              members={members}
              onCancel={() => setIsAdding(false)}
              onAdded={(expense) => {
                setExpenses((prev) => [...prev, expense])
                setIsAdding(false)
              }}
            />
          </div>
        ) : null}

        <ExpenseList expenses={expenses} members={members} />
      </section>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold tracking-tight">
          누가 누구에게
        </h2>
        <SettlementList settlements={settlements} members={members} />
        <p className="rounded-inner border-line text-muted mt-4 border border-dashed p-4 text-xs leading-relaxed">
          MOCK · 이 송금 목록은 미리 계산해 둔 고정값입니다. 지출을 새로 넣어도
          다시 계산되지 않습니다. 엔빵·운전자 할인·송금 최소화 로직은
          lib/settle/이 생길 때 붙습니다.
        </p>
      </section>
    </div>
  )
}
