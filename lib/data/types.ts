/**
 * 도메인 타입의 단일 출처. PROJECT_SPEC.md §3이 원본이다.
 * Destination / QuizQuestion / CompatResult는 SPEC에 타입 정의가 없어 화면 요구에 맞춰 여기서 정의한다.
 */

export type DestinationTheme =
  'sea' | 'mountain' | 'city' | 'healing' | 'activity'
export type BudgetLevel = 'low' | 'mid' | 'high'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type QuizAxis = 'plan' | 'morning' | 'activity' | 'budget'

export type AuthProvider = 'email' | 'kakao' | 'google'

export type Profile = {
  id: string
  /** 실명. 가입 시 1회 입력한다. 여행방 안의 표시 이름은 Member.displayName이다. */
  name: string
  email: string
  /** 숫자만. 하이픈은 저장하지 않는다. */
  phone: string
  birthDate: string
  provider: AuthProvider
  /** 정산 완료 시 +1. 증가 로직은 아직 없다. */
  completedTripCount: number
  createdAt: string
  travelStyle?: QuizResult
}

/**
 * 자격증명이 붙은 회원. authRepo 안에서만 존재한다.
 * AuthRepository의 어떤 메서드도 이 타입을 반환하지 않는다 —
 * Profile이 서버 컴포넌트에서 클라이언트 prop으로 넘어가면 HTML에 직렬화되기 때문이다.
 */
export type Account = Profile & { passwordHash: string }

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
  /** 이 여행방에서 쓰는 이름. 참여 시 기본값은 Profile.name이다. */
  displayName: string
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
  /** 시도 단위 키('강원', '부산' …). PROVINCE_TO_REGION이 만든다. */
  region?: string
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
