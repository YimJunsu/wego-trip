import type {
  CompatResult,
  Destination,
  DestinationFilter,
  Expense,
  Member,
  Profile,
  Place,
  QuizQuestion,
  Settlement,
  Trip,
} from './types'

/**
 * 데이터 접근 계약. UI는 이 인터페이스만 알고, mock인지 실서버인지 몰라야 한다.
 * 구현 교체 시 화면은 건드리지 않는다. (CONVENTIONS.md §4)
 */

/**
 * mock 전용 장치. 화면의 빈/로딩/에러 상태를 눈으로 확인하려고 넣었다.
 * 페이지가 `?state=` search param을 읽어 그대로 넘긴다. 실서버 구현은 이 값을 무시한다.
 * Supabase 전환 시 제거 대상.
 */
export type DataState = 'empty' | 'loading' | 'error'
export type QueryOptions = { state?: DataState }

export type CreateTripInput = {
  name: string
  region: string
  startDate: string
  endDate: string
  coverTheme: Trip['coverTheme']
}

export type AddExpenseInput = {
  tripId: string
  payerId: string
  amount: number
  description: string
  category: string
  participantIds: string[]
}

export interface ProfileRepository {
  me(opts?: QueryOptions): Promise<Profile>
  listByTrip(tripId: string, opts?: QueryOptions): Promise<Profile[]>
}

export interface TripRepository {
  list(opts?: QueryOptions): Promise<Trip[]>
  get(id: string, opts?: QueryOptions): Promise<Trip | null>
  create(input: CreateTripInput): Promise<Trip>
  joinByCode(code: string): Promise<Trip>
  listMembers(tripId: string, opts?: QueryOptions): Promise<Member[]>
}

export interface ExpenseRepository {
  listByTrip(tripId: string, opts?: QueryOptions): Promise<Expense[]>
  add(input: AddExpenseInput): Promise<Expense>
}

export interface SettlementRepository {
  /** 지금은 계산하지 않는다. seed에 미리 담긴 송금 리스트를 반환한다. */
  listByTrip(tripId: string, opts?: QueryOptions): Promise<Settlement[]>
}

export interface DestinationRepository {
  list(filter?: DestinationFilter, opts?: QueryOptions): Promise<Destination[]>
  draw(
    filter?: DestinationFilter,
    opts?: QueryOptions,
  ): Promise<Destination | null>
}

export interface PlaceRepository {
  listByTrip(tripId: string, opts?: QueryOptions): Promise<Place[]>
  toggleSave(placeId: string, tripId: string): Promise<Place>
}

export interface CompatRepository {
  questions(opts?: QueryOptions): Promise<QuizQuestion[]>
  /** 점수 산출 로직은 아직 없다. answers는 받되 결과는 seed 고정값이다. */
  result(answers: number[], opts?: QueryOptions): Promise<CompatResult>
}
