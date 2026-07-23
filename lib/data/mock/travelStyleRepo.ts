import questionSeed from '@/mocks/quiz.json'
import styleSeed from '@/mocks/travelStyles.json'
import type { TravelStyleRepository } from '../repositories'
import type { QuizQuestion, TravelStyle } from '../types'

const questions = questionSeed as QuizQuestion[]
const styles = styleSeed as TravelStyle[]

export const mockTravelStyleRepo: TravelStyleRepository = {
  async questions() {
    return questions
  },

  async list() {
    return styles
  },

  async get(code) {
    return styles.find((s) => s.code === code.toUpperCase()) ?? null
  },
}
