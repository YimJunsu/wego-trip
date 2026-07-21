'use server'

// 클라이언트 컴포넌트는 데이터 계층을 직접 import하면 안 된다 — '@/lib/data' 배럴은
// mockAuthRepo(→ node:crypto, seed 계정)까지 함께 물고 있어 그대로 import하면 브라우저
// 번들에 실려 나간다. 여기서 한 겹 감싸 서버에서만 repo를 불러 쓰게 한다.
import { requireMember } from '@/lib/auth/session'
import { expenseRepo, tripRepo } from '@/lib/data'
import type { AddExpenseInput } from '@/lib/data/repositories'
import type { Expense } from '@/lib/data/types'

export async function addExpense(input: AddExpenseInput): Promise<Expense> {
  await requireMember(input.tripId)

  // payerId도 이 방의 멤버여야 한다 — 방 밖의 사람에게 결제를 떠넘기지 못하게 막는다.
  const members = await tripRepo.listMembers(input.tripId)
  if (!members.some((m) => m.userId === input.payerId)) {
    throw new Error('결제자는 이 여행방의 멤버여야 합니다.')
  }

  // 나눠 낼 사람도 전부 이 방의 멤버여야 한다 — 방 밖의 사람에게 빚을 지울 수 없게 막는다.
  if (
    input.participantIds.length === 0 ||
    !input.participantIds.every((id) => members.some((m) => m.userId === id))
  ) {
    throw new Error('나눠 낼 사람은 모두 이 여행방의 멤버여야 합니다.')
  }

  // 통화는 원(₩) 정수다. 음수·소수는 정산액을 뒤집거나 어긋나게 만든다.
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error('금액은 0보다 큰 정수(원)여야 합니다.')
  }

  if (!input.description.trim()) {
    throw new Error('뭘 샀는지 적어야 합니다.')
  }

  return expenseRepo.add(input)
}
