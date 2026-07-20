# CONVENTIONS — 개발·협업 규칙

"어떻게 만드는가". 실무·협업 기준. Claude Code와 팀원 모두 이 규칙을 따른다.

---

## 1. 폴더 구조

```
app/
  (app)/                 # 로그인 후 영역
    page.tsx             # 홈/대시보드
    random/
    trips/
      new/
      [tripId]/
        settle/
        places/
    join/
    compat/
  layout.tsx
  globals.css
components/
  ui/                    # 공통 프리미티브 (Button, Card, Input, Badge …)
  dashboard/             # 대시보드용 소프트 미니멀 컴포넌트
  boarding-pass/         # 초대·여행권 보딩패스 컴포넌트
lib/
  data/                  # 데이터 접근 계층 (아래 §4)
    types.ts             # 도메인 타입 = 단일 출처
    repositories.ts      # 인터페이스 정의
    mock/                # 현재 구현 (메모리/JSON)
    supabase/            # 이후 구현 (지금은 비움)
    index.ts             # 소스 스위치
  settle/                # 정산 순수 함수 + 테스트
  utils/                 # 포맷터, 상수 등
mocks/                   # seed JSON (여행지·맛집·유저 등)
docs/
styles/
```

- 라우팅은 App Router. 데이터 페칭은 서버 컴포넌트 우선, 인터랙션 필요할 때만 `"use client"`.
- 한 파일 한 책임. 컴포넌트 200줄 넘으면 쪼갠다.

## 2. 네이밍

- 컴포넌트 파일·심볼: `PascalCase` (`TripCard.tsx`).
- 훅: `useXxx`. 유틸/함수: `camelCase`. 상수: `UPPER_SNAKE`.
- 타입/인터페이스: `PascalCase`, 접두사 `I`/`T` 붙이지 않는다.
- 라우트 폴더: 소문자 케밥(`trips`, `[tripId]`).
- 불리언은 `is/has/should` 접두사 (`isDriver`, `hasPaid`).

## 3. 코드 스타일

- TypeScript **strict**. `any` 금지(불가피 시 `// TODO(type):`).
- 함수형 컴포넌트만. 기본 export 대신 named export 선호.
- 색·간격·폰트는 Tailwind 토큰만. 인라인 hex/px 금지.
- 부수효과 없는 계산은 순수 함수로 빼서 테스트 가능하게.
- 주석은 "왜"를 적는다. "무엇"은 코드로.
- ESLint + Prettier. 커밋 전 `pnpm lint && pnpm typecheck` 통과.

## 4. 목데이터 어댑터 패턴 (핵심)

UI는 데이터 소스를 몰라야 한다. 인터페이스 → 구현 → 스위치 3단.

```ts
// lib/data/repositories.ts  — 인터페이스 (계약)
export interface TripRepository {
  list(): Promise<Trip[]>
  get(id: string): Promise<Trip | null>
  create(input: CreateTripInput): Promise<Trip>
  joinByCode(code: string): Promise<Trip>
}
export interface ExpenseRepository {
  listByTrip(tripId: string): Promise<Expense[]>
  add(input: AddExpenseInput): Promise<Expense>
}
// … PlaceRepository, ProfileRepository 등
```

```ts
// lib/data/mock/tripRepo.ts — 현재 구현
import seed from '@/mocks/trips.json'
export const mockTripRepo: TripRepository = {
  async list() {
    return seed as Trip[]
  },
  async get(id) {
    return (seed as Trip[]).find((t) => t.id === id) ?? null
  },
  async create(input) {
    /* 메모리에 추가 */
  },
  async joinByCode(code) {
    /* 코드로 조회 */
  },
}
```

```ts
// lib/data/index.ts — 스위치
import { mockTripRepo } from './mock/tripRepo'
// import { supabaseTripRepo } from './supabase/tripRepo'  // 이후

const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock'
export const tripRepo: TripRepository =
  source === 'supabase' ? /* supabaseTripRepo */ mockTripRepo : mockTripRepo
```

규칙:

- 컴포넌트/페이지는 `lib/data/index.ts`가 export한 repo만 import한다.
- mock 구현은 실제 지연·에러를 흉내 내도 좋다(로딩/에러 상태 검증용).
- Supabase 붙일 때 `supabase/` 폴더만 채우고 스위치만 바꾼다. 화면은 안 건드린다.

## 5. 정산 로직 규칙

- `lib/settle/` 안의 순수 함수로만. React/데이터 의존 금지.
- 입력: 지출 목록 + 멤버(운전자 여부) + 할인 옵션 → 출력: `Settlement[]`.
- 반올림: 내부 계산은 소수 유지, **최종 송금액만 원 단위 반올림**. 반올림 오차는 채권자 쪽에서 흡수(합계 보존).
- `PROJECT_SPEC.md` §1.3의 예시를 테스트 케이스로 고정.

## 6. Git · 협업

- 브랜치: `feat/…` `fix/…` `chore/…` `docs/…` (예: `feat/settle-driver-discount`).
- 커밋: [Conventional Commits](https://www.conventionalcommits.org). `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- PR은 작게(하나의 기능/화면). UI 변경엔 스크린샷 필수.
- `main` 직접 푸시 금지. PR 리뷰 1인 이상.
- PR 셀프 체크: `pnpm lint` `pnpm typecheck` 통과 · mock으로 빈/로딩/에러/정상 확인 · 시크릿 미포함.

## 7. 환경 변수

- `.env.local`은 커밋 금지. `.env.example`만 커밋.
- 지금 필요한 것: `NEXT_PUBLIC_DATA_SOURCE=mock`
- 이후 추가: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `KAKAO_REST_API_KEY` 등. 지금은 넣지 않는다.

## 8. 커밋 전 체크리스트

- [ ] `pnpm lint` `pnpm typecheck` 통과
- [ ] 새 데이터 접근은 `lib/data/` 인터페이스 경유
- [ ] 하드코딩 색/px 없음, Tailwind 토큰 사용
- [ ] 화면의 빈/로딩/에러 상태 확인
- [ ] 시크릿·API 키 미포함
