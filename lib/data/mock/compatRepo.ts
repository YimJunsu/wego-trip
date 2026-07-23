import questionSeed from '@/mocks/quiz.json'
import resultSeed from '@/mocks/compat.json'
import type { CompatRepository } from '../repositories'
import type {
  CompatAxisBreakdown,
  CompatMember,
  CompatResult,
  QuizQuestion,
} from '../types'
import { findProfile } from './authRepo'

const questions = questionSeed as QuizQuestion[]

function toCompatMember(profile: { id: string; name: string }): CompatMember {
  return { id: profile.id, name: profile.name }
}

function buildResult(): CompatResult {
  const [leftId, rightId] = resultSeed.members
  const left = findProfile(leftId)
  const right = findProfile(rightId)
  if (!left || !right)
    throw new Error('mock: 궁합 상대 프로필 seed가 없습니다.')

  return {
    percent: resultSeed.percent,
    headline: resultSeed.headline,
    description: resultSeed.description,
    members: [toCompatMember(left), toCompatMember(right)],
    breakdown: resultSeed.breakdown as CompatAxisBreakdown[],
  }
}

export const mockCompatRepo: CompatRepository = {
  async questions() {
    return questions
  },

  /** answers는 아직 쓰이지 않는다. 점수 산출 로직이 붙기 전까지 결과는 고정값이다. */
  async result() {
    return buildResult()
  },
}
