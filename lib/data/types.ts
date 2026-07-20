/**
 * 도메인 타입의 단일 출처. PROJECT_SPEC.md §3이 원본이다.
 * Destination / QuizQuestion / CompatResult는 SPEC에 타입 정의가 없어 화면 요구에 맞춰 여기서 정의한다.
 */

export type DestinationTheme =
  'sea' | 'mountain' | 'city' | 'healing' | 'activity'
export type BudgetLevel = 'low' | 'mid' | 'high'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type QuizAxis = 'plan' | 'morning' | 'activity' | 'budget'

export type Profile = {
  id: string
  nickname: string
  avatarUrl?: string
  travelStyle?: QuizResult
}

export type Trip = {
  id: string
  name: string
  region: string
  startDate: string
  endDate: string
  inviteCode: string
  createdBy: string
  coverTheme: DestinationTheme
}

export type Member = {
  tripId: string
  userId: string
  role: 'host' | 'member'
  isDriver: boolean
}

export type Expense = {
  id: string
  tripId: string
  payerId: string
  amount: number
  description: string
  category: string
  participantIds: string[]
  createdAt: string
}

export type Place = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  isChakan: boolean
  savedToTripId?: string
}

export type QuizResult = {
  userId: string
  answers: number[]
  scores: Record<QuizAxis, number>
}

/** 계산 결과. 저장하지 않는다. 지금은 mock seed에 미리 담긴 값을 그대로 쓴다. */
export type Settlement = {
  from: string
  to: string
  amount: number
}

export type Destination = {
  id: string
  name: string
  region: string
  themes: DestinationTheme[]
  budget: BudgetLevel
  seasons: Season[]
  summary: string
  emoji: string
}

export type DestinationFilter = {
  themes?: DestinationTheme[]
  budget?: BudgetLevel
  season?: Season
}

export type QuizQuestion = {
  id: string
  axis: QuizAxis
  text: string
  options: [QuizOption, QuizOption]
}

export type QuizOption = {
  label: string
  /** 축의 어느 쪽으로 기우는지. 낮을수록 축 이름 쪽(예: plan=계획형), 높을수록 반대쪽(즉흥형). */
  score: number
}

export type CompatAxisBreakdown = {
  axis: QuizAxis
  label: string
  leftLabel: string
  rightLabel: string
  /** 0~100. 두 사람의 위치. */
  left: number
  right: number
}

export type CompatResult = {
  percent: number
  headline: string
  description: string
  members: [Profile, Profile]
  breakdown: CompatAxisBreakdown[]
}
