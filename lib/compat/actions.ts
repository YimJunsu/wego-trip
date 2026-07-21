'use server'

// 클라이언트 컴포넌트는 데이터 계층을 직접 import하면 안 된다 — '@/lib/data' 배럴은
// mockAuthRepo(→ node:crypto, seed 계정)까지 함께 물고 있어 그대로 import하면 브라우저
// 번들에 실려 나간다. 여기서 한 겹 감싸 서버에서만 repo를 불러 쓰게 한다.
import { compatRepo } from '@/lib/data'
import type { QueryOptions } from '@/lib/data/repositories'
import type { CompatResult } from '@/lib/data/types'

export async function getCompatResult(
  answers: number[],
  opts?: QueryOptions,
): Promise<CompatResult> {
  return compatRepo.result(answers, opts)
}
