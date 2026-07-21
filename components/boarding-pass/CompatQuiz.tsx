'use client'

import { useState } from 'react'
import { CompatResultCard } from '@/components/boarding-pass/CompatResultCard'
import { PassButton } from '@/components/boarding-pass/PassButton'
import { PassCard, PassTear } from '@/components/boarding-pass/PassCard'
import { getCompatResult } from '@/lib/compat/actions'
import type { DataState } from '@/lib/data/repositories'
import type { CompatResult, QuizQuestion } from '@/lib/data/types'

type Phase = 'quiz' | 'scoring' | 'result' | 'error'

export function CompatQuiz({
  questions,
  state,
}: {
  questions: QuizQuestion[]
  state?: DataState
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>('quiz')
  const [result, setResult] = useState<CompatResult | null>(null)

  const question = questions[step]

  async function answer(score: number) {
    const next = [...answers, score]
    setAnswers(next)

    if (step + 1 < questions.length) {
      setStep(step + 1)
      return
    }

    setPhase('scoring')
    try {
      setResult(await getCompatResult(next, { state }))
      setPhase('result')
    } catch {
      setPhase('error')
    }
  }

  function restart() {
    setStep(0)
    setAnswers([])
    setResult(null)
    setPhase('quiz')
  }

  if (phase === 'result' && result) {
    return (
      <div className="flex flex-col gap-5">
        <CompatResultCard result={result} />
        <p className="border-pass-line text-pass-navy/70 rounded-pass border border-dashed p-3 font-mono text-xs tracking-widest">
          MOCK · 점수 산출 로직이 아직 없어 결과는 고정값입니다. 답을 바꿔도
          같은 카드가 나옵니다.
        </p>
        <PassButton onClick={restart}>다시 하기</PassButton>
      </div>
    )
  }

  if (phase === 'scoring') {
    return (
      <PassCard className="p-10 text-center">
        <p className="font-mono text-sm tracking-widest" role="status">
          MATCHING…
        </p>
      </PassCard>
    )
  }

  if (phase === 'error') {
    return (
      <PassCard className="p-8 text-center">
        <p className="text-pass-stamp font-mono text-sm tracking-widest">
          궁합을 내지 못했습니다
        </p>
        <PassButton className="mt-4" onClick={restart}>
          다시 하기
        </PassButton>
      </PassCard>
    )
  }

  if (!question) return null

  return (
    <PassCard className="p-6">
      <div className="flex justify-between text-xs tracking-widest">
        <span>QUESTION</span>
        <span>
          {step + 1} / {questions.length}
        </span>
      </div>

      <div
        className="bg-paper border-pass-line mt-3 h-1.5 overflow-hidden rounded-full border"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
      >
        <div
          className="bg-pass-navy h-full transition-all duration-300"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="font-body mt-5 text-lg leading-snug">{question.text}</p>

      <PassTear />

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <PassButton
            key={option.label}
            className="font-body text-left text-base tracking-normal"
            onClick={() => answer(option.score)}
          >
            {option.label}
          </PassButton>
        ))}
      </div>
    </PassCard>
  )
}
