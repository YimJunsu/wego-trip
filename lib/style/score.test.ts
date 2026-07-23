import { test } from 'node:test'
import assert from 'node:assert/strict'
import questions from '../../mocks/quiz.json' with { type: 'json' }
import styles from '../../mocks/travelStyles.json' with { type: 'json' }
import {
  AXIS_ORDER,
  axisScores,
  codeDistance,
  nearestCodes,
  scoreQuiz,
  toStyleCode,
} from './score.ts'

const QUESTIONS = questions as { id: string; axis: string; text: string }[]

/** 모든 문항에 같은 값으로 답한다. */
const allAnswers = (score: number) => QUESTIONS.map(() => score)

test('축마다 문항이 홀수 개다 — 짝수면 평균 50 동점이 생긴다', () => {
  for (const axis of AXIS_ORDER) {
    const count = QUESTIONS.filter((q) => q.axis === axis).length
    assert.ok(count > 0, `${axis} 문항이 없다`)
    assert.equal(
      count % 2,
      1,
      `${axis} 문항이 ${count}개(짝수)라 동점이 날 수 있다`,
    )
  }
})

test('전부 0점이면 낮은 쪽 글자만 나온다', () => {
  assert.equal(scoreQuiz(QUESTIONS as never, allAnswers(0)).code, 'PMAS')
})

test('전부 100점이면 높은 쪽 글자만 나온다', () => {
  assert.equal(scoreQuiz(QUESTIONS as never, allAnswers(100)).code, 'FNRL')
})

test('축 점수는 그 축 문항만 평균낸다', () => {
  // plan 문항에만 100, 나머지는 0
  const answers = QUESTIONS.map((q) => (q.axis === 'plan' ? 100 : 0))
  const scores = axisScores(QUESTIONS as never, answers)
  assert.equal(scores.plan, 100)
  assert.equal(scores.morning, 0)
  assert.equal(scores.activity, 0)
  assert.equal(scores.budget, 0)
})

test('정확히 50이면 낮은 쪽으로 붙는다', () => {
  assert.equal(
    toStyleCode({ plan: 50, morning: 50, activity: 50, budget: 50 }),
    'PMAS',
  )
})

test('답이 모자라면 answer 없는 문항은 빼고 평균낸다', () => {
  const scores = axisScores(QUESTIONS as never, [100, 100, 100])
  assert.equal(scores.plan, 100)
  // 답이 하나도 없는 축은 중앙값 50 → 낮은 쪽
  assert.equal(scores.budget, 50)
})

test('16가지 코드가 모두 seed에 있다', () => {
  const codes = new Set(styles.map((s) => s.code))
  assert.equal(codes.size, 16, '코드가 중복됐거나 16개가 아니다')
  for (const p of ['P', 'F'])
    for (const m of ['M', 'N'])
      for (const a of ['A', 'R'])
        for (const b of ['S', 'L'])
          assert.ok(codes.has(`${p}${m}${a}${b}`), `${p}${m}${a}${b} 없음`)
})

test('matchCode는 실재하는 코드를 가리킨다', () => {
  const codes = new Set(styles.map((s) => s.code))
  for (const style of styles) {
    assert.ok(
      codes.has(style.matchCode),
      `${style.code} → ${style.matchCode} 없음`,
    )
  }
})

test('코드 거리는 어긋난 축의 수다', () => {
  assert.equal(codeDistance('PMAS', 'PMAS'), 0)
  assert.equal(codeDistance('PMAS', 'FNRL'), 4)
  assert.equal(codeDistance('PMAS', 'PMAL'), 1)
})

test('잘 맞는 유형은 seed 궁합이 맨 앞이고 자기 자신은 빠진다', () => {
  const all = styles.map((s) => s.code)
  for (const style of styles) {
    const picked = nearestCodes(style.code, style.matchCode, all, 3)
    assert.equal(picked.length, 3, `${style.code}: 3개가 아니다`)
    assert.equal(
      picked[0],
      style.matchCode,
      `${style.code}: 궁합이 맨 앞이 아니다`,
    )
    assert.ok(
      !picked.includes(style.code),
      `${style.code}: 자기 자신이 들어갔다`,
    )
    assert.equal(new Set(picked).size, 3, `${style.code}: 중복이 있다`)
  }
})

test('궁합 다음 자리는 축이 덜 어긋난 유형이 온다', () => {
  const all = styles.map((s) => s.code)
  const picked = nearestCodes('PMAS', 'FMRS', all, 3)
  // 뒤 두 자리는 PMAS와 1축만 다른 유형이어야 한다
  for (const code of picked.slice(1)) {
    assert.equal(codeDistance('PMAS', code), 1, `${code}는 너무 멀다`)
  }
})
