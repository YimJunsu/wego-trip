import type { QuizAxis, QuizQuestion, StyleCode } from '@/lib/data/types'

/**
 * 축별 두 극단의 글자. 점수가 낮으면 low, 높으면 high 쪽이다.
 * 코드 글자 순서는 AXIS_ORDER를 따르고, 이 순서가 곧 공유 URL이라 바꾸지 않는다.
 */
export const AXIS_ORDER: readonly QuizAxis[] = [
  'plan',
  'morning',
  'activity',
  'budget',
]

export const AXIS_META: Record<
  QuizAxis,
  {
    label: string
    low: { letter: string; label: string }
    high: { letter: string; label: string }
  }
> = {
  plan: {
    label: '계획',
    low: { letter: 'P', label: '계획형' },
    high: { letter: 'F', label: '즉흥형' },
  },
  morning: {
    label: '시간대',
    low: { letter: 'M', label: '아침형' },
    high: { letter: 'N', label: '밤형' },
  },
  activity: {
    label: '체력',
    low: { letter: 'A', label: '액티브' },
    high: { letter: 'R', label: '휴식형' },
  },
  budget: {
    label: '지갑',
    low: { letter: 'S', label: '가성비' },
    high: { letter: 'L', label: '플렉스' },
  },
}

/** 0~100. 축에 속한 문항 점수의 평균. 문항이 없으면 중앙값 50. */
export function axisScores(
  questions: QuizQuestion[],
  answers: number[],
): Record<QuizAxis, number> {
  const sum = {} as Record<QuizAxis, { total: number; count: number }>
  for (const axis of AXIS_ORDER) sum[axis] = { total: 0, count: 0 }

  questions.forEach((question, i) => {
    const answer = answers[i]
    if (answer === undefined) return
    const bucket = sum[question.axis]
    bucket.total += answer
    bucket.count += 1
  })

  const scores = {} as Record<QuizAxis, number>
  for (const axis of AXIS_ORDER) {
    const { total, count } = sum[axis]
    scores[axis] = count === 0 ? 50 : Math.round(total / count)
  }
  return scores
}

/**
 * 축 점수 → 4글자 코드. 정확히 50이면 low 쪽으로 붙인다 —
 * 축마다 홀수 문항(3개)이라 실제로는 50이 나오지 않지만, 문항 수가 바뀌어도 결과는 하나여야 한다.
 */
export function toStyleCode(scores: Record<QuizAxis, number>): StyleCode {
  return AXIS_ORDER.map((axis) => {
    const meta = AXIS_META[axis]
    return scores[axis] > 50 ? meta.high.letter : meta.low.letter
  }).join('')
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: number[],
): { code: StyleCode; scores: Record<QuizAxis, number> } {
  const scores = axisScores(questions, answers)
  return { code: toStyleCode(scores), scores }
}

/** 코드 두 개가 다른 축의 수. 0이면 같은 유형, 4면 정반대. */
export function codeDistance(a: StyleCode, b: StyleCode): number {
  return AXIS_ORDER.reduce((n, _axis, i) => (a[i] === b[i] ? n : n + 1), 0)
}

/**
 * 잘 맞는 유형 목록. seed가 지정한 궁합(matchCode)을 맨 앞에 두고,
 * 나머지는 축이 덜 어긋난 순으로 채운다. 자기 자신은 뺀다.
 */
export function nearestCodes(
  code: StyleCode,
  matchCode: StyleCode,
  all: StyleCode[],
  count: number,
): StyleCode[] {
  const rest = all
    .filter((c) => c !== code && c !== matchCode)
    .sort(
      (a, b) =>
        codeDistance(code, a) - codeDistance(code, b) || a.localeCompare(b),
    )
  return [matchCode, ...rest].slice(0, count)
}
