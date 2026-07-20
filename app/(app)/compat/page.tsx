import { CompatQuiz } from '@/components/boarding-pass/CompatQuiz'
import { PassCard } from '@/components/boarding-pass/PassCard'
import { compatRepo, parseDataState } from '@/lib/data'
import type { PageProps } from '@/lib/types/page'

export default async function CompatPage({ searchParams }: PageProps) {
  const { state } = await searchParams
  const opts = { state: parseDataState(state) }
  const questions = await compatRepo.questions(opts)

  return (
    <div className="flex flex-col gap-6">
      <header className="text-pass-navy">
        <p className="font-mono text-xs tracking-widest opacity-70">
          TRAVEL MATCH
        </p>
        <h1 className="mt-1 font-mono text-2xl tracking-widest">여행 궁합</h1>
        <p className="mt-2 text-sm opacity-80">
          {questions.length}문항. 같이 갈 사람과 얼마나 맞는지 봅니다.
        </p>
      </header>

      {questions.length === 0 ? (
        <PassCard className="p-10 text-center">
          <p className="font-mono text-sm tracking-widest">문항이 없습니다</p>
          <p className="font-body mt-2 text-sm opacity-70">
            퀴즈를 불러오지 못했습니다. 잠시 후 다시 오세요.
          </p>
        </PassCard>
      ) : (
        <CompatQuiz questions={questions} state={parseDataState(state)} />
      )}
    </div>
  )
}
