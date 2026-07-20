import { mockCompatRepo } from './mock/compatRepo'
import { mockDestinationRepo } from './mock/destinationRepo'
import { mockExpenseRepo } from './mock/expenseRepo'
import { mockPlaceRepo } from './mock/placeRepo'
import { mockProfileRepo } from './mock/profileRepo'
import { mockSettlementRepo } from './mock/settlementRepo'
import { mockTripRepo } from './mock/tripRepo'
import type {
  CompatRepository,
  DestinationRepository,
  ExpenseRepository,
  PlaceRepository,
  ProfileRepository,
  SettlementRepository,
  TripRepository,
} from './repositories'

/**
 * 데이터 소스 스위치. 화면은 여기서 export한 repo만 import한다. (CONVENTIONS.md §4)
 *
 * 지금은 mock 구현만 있다. Supabase를 붙일 땐 lib/data/supabase/를 같은 인터페이스로
 * 채우고 이 파일에서만 갈아끼운다. 화면은 건드리지 않는다:
 *
 *   export const tripRepo: TripRepository =
 *     process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase' ? supabaseTripRepo : mockTripRepo
 */
export const profileRepo: ProfileRepository = mockProfileRepo
export const tripRepo: TripRepository = mockTripRepo
export const expenseRepo: ExpenseRepository = mockExpenseRepo
export const settlementRepo: SettlementRepository = mockSettlementRepo
export const destinationRepo: DestinationRepository = mockDestinationRepo
export const placeRepo: PlaceRepository = mockPlaceRepo
export const compatRepo: CompatRepository = mockCompatRepo

export { CURRENT_USER_ID } from './mock/profileRepo'
export { parseDataState } from './mock/state'
