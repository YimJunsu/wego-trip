# mock UI 장치 제거 + 기능 기반 구조 리팩토링

작성일: 2026.07.21

## 배경

UI/MVP 프로토타입이 Vercel에 반영되며 화면이 확정됐다. 프로토타입 기간에 화면의
빈/로딩/에러 상태를 눈으로 확인하려고 넣었던 mock 전용 장치는 목적을 다했다.

반면 데이터 모델과 백엔드(Supabase)는 아직 미확정이다. 따라서 **UI 쪽 mock 장치는
계약까지 전부 걷어내되, 데이터 쪽 mock(seed JSON + mock repository)은 그대로 둔다.**

이어서 `components/dashboard/` 에 25개 파일이 쌓인 현재 구조를 기능 기반으로 재편한다.

## 목표

1. mock 전용 UI 장치를 repository 인터페이스에서까지 완전히 제거한다.
2. 사용처가 없는 죽은 코드를 제거한다.
3. 컴포넌트를 기능(feature) 축으로 재배치하고, 디자인 두 갈래를 폴더가 아닌
   프리미티브 세트로 구분한다.
4. 컨벤션(한 파일 한 책임, 200줄) 위반을 해소한다.

## 비목표

- 데이터 모델 변경, Supabase 연동, 외부 API 연동
- `mocks/*.json` seed 내용 수정
- 화면 디자인·레이아웃·인터랙션 변경 (순수 이동/삭제만 한다)
- 테스트 인프라 도입

---

## 1. mock UI 장치 제거

`?state=` search param으로 빈/로딩/에러 상태를 재현하던 배관 전체를 제거한다.

| 대상 | 조치 |
| --- | --- |
| `components/dashboard/MockStateBar.tsx` | 파일 삭제 |
| `app/(app)/layout.tsx` | `MockStateBar` 및 이를 감싸던 `Suspense` 제거, `main` 의 `pb-24` → `pb-12`, "하단 mock 상태바" 주석 제거 |
| `lib/data/mock/state.ts` | 파일 삭제 (`resolve`, `delay`, `MockDataError`, `parseDataState`, 지연 상수) |
| `lib/data/repositories.ts` | `DataState`, `QueryOptions` 타입 삭제. 전 메서드에서 `opts?: QueryOptions` 파라미터 제거 |
| `lib/data/mock/*Repo.ts` (7개) | `resolve(opts, data, emptyValue)` 래핑을 걷고 값을 직접 반환 |
| `lib/data/index.ts` | `parseDataState` re-export 제거 |
| `app/(app)/page.tsx` 외 페이지 6개 | `searchParams` 인자, `parseDataState` import, `opts` 전달 제거 |
| `lib/types/page.ts` | `searchParams` 필드 제거. `PageProps<Params>` 는 `params` 만 갖는다 |
| `components/boarding-pass/CompatQuiz.tsx` | `state?: DataState` prop 및 사용처 제거 |
| `components/dashboard/RandomDrawer.tsx` | `state?: DataState` prop 및 사용처 제거 |

`?state=` 를 넘기던 페이지: `page.tsx`, `random/page.tsx`, `compat/page.tsx`,
`trips/[tripId]/page.tsx`, `trips/[tripId]/places/page.tsx`,
`trips/[tripId]/settle/page.tsx`.

**유지한다:** `app/(app)/loading.tsx`, `app/(app)/error.tsx`, `Skeleton`,
`EmptyState`. 실서버에서도 동작하는 진짜 상태다.

**함께 사라지는 것:** mock repository의 인위적 지연(정상 150ms / 로딩 3000ms /
에러 400ms). mock은 이제 동기적으로 값을 반환하는 `async` 함수가 된다.

## 2. 죽은 코드 제거

사용처가 0인 것을 확인했다.

- `components/dashboard/Card.tsx` — 파일 전체 (`Card`, `SectionLabel`)
- `components/dashboard/ActionButton.tsx` 의 `IconButton`
- `lib/geo/dart.ts` 의 `MAX_PULL`, `FLIGHT_RANGE`

`Skeleton.tsx` 의 `SkeletonBlock` 도 처음엔 삭제 대상이었으나, 다트 여행지 연동
(`2026-07-21-dart-destination-and-dmz-design.md`)에서 여행지 조회 로딩에 쓰게 되어
목록에서 뺐다.

## 3. 유지 (데이터 mock)

건드리지 않는다.

- `mocks/*.json` 9개 seed
- `lib/data/mock/*Repo.ts` 7개의 본체 로직 (§1의 `resolve` 제거만 적용)
- `lib/data/index.ts` 의 소스 스위치 구조
- `lib/data/types.ts` 도메인 타입

## 4. 기능 기반 디렉토리 재편

```
components/
  ui/          중립 프리미티브
               Button Badge Avatar Field TextField
               ActionButton FilterChip EmptyState Skeleton TabBar
  pass/        보딩패스 디자인 킷
               PassCard PassButton Stamp
  features/
    trip/      TripCard TripPass TripDetailTabs NewTripForm
               DayPlanList MemberList CopyCodeButton ThemeBadge
    settle/    SettlePanel AddExpenseForm ExpenseList SettlementList
    places/    PlacesPanel MapPlaceholder
    random/    RandomDrawer RandomModeTabs DrawSlot DestinationCard
      dart/    DartBoard KoreaMapLayer DartResultCard
               DestinationSlot useDartThrow.ts
    invite/    JoinForm InviteCodeInput
    compat/    CompatQuiz CompatResultCard
```

`components/dashboard/` 와 `components/boarding-pass/` 폴더는 사라진다.

**디자인 두 갈래를 폴더로 나누지 않는 이유:** 지금 구조는 `dashboard/` 안에서도
보딩패스 스타일을 쓸 수 있어 규칙을 강제하지 못한다. 재편 후에는 feature 컴포넌트가
`ui/` 를 import 했는지 `pass/` 를 import 했는지가 곧 어느 디자인 언어인지의 답이
된다. 폴더 위치보다 import 그래프가 강한 제약이다.

배치는 구현 시 실제 import 그래프로 최종 확인한다. 두 개 이상 feature에서 쓰이는
컴포넌트는 `ui/` 또는 `pass/` 로 올린다.

## 5. DartGame 분해

`components/dashboard/DartGame.tsx` 449줄 — 컨벤션 200줄 초과. 여행지 연동으로
`DestinationState` 와 `pickDestination` 이 들어오면서 더 커졌다.

- `features/random/dart/useDartThrow.ts` — 상태머신(`Mode`/`Phase`/`Outcome`),
  포인터 핸들러, rAF 비행 애니메이션, 히트 테스트, 북한 판정, 여행지 조회
  (`DestinationState` · `throwIdRef` 무효화), 정리(cleanup)
- `features/random/dart/DartBoard.tsx` — SVG 표현. 파워링·조준선·착지핀·다트·
  블라인드 오버레이는 파일 내부 지역 컴포넌트로 둔다 (외부에서 쓸 일이 없다)
- `features/random/dart/DestinationSlot.tsx` — 다트 결과 아래 여행지 칸.
  지금은 `DartGame.tsx` 안의 지역 컴포넌트인데, 훅과 보드를 가르면 갈 곳이 없어진다.

동작은 바꾸지 않는다. `prefers-reduced-motion` 분기, 울릉군 인셋 좌표 보정,
`setPointerCapture` try/catch, 늦게 온 여행지 응답 무효화 등 기존 주석에 남은
"왜"는 그대로 옮긴다.

## 6. 문서 동기화

- `CONVENTIONS.md` §1 폴더 구조 트리 갱신
- `CONVENTIONS.md` §4 의 "mock 구현은 실제 지연·에러를 흉내 내도 좋다" 규칙 삭제
- `DESIGN_SYSTEM.md` 의 `dashboard/` · `boarding-pass/` 폴더 언급을 `ui/` · `pass/` 로
- `CLAUDE.md` 의 디자인 두 갈래 문단에 프리미티브 세트 구분 반영

---

## 검증

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm build`
4. `pnpm dev` 로 8개 라우트 육안 확인:
   `/`, `/random`, `/join`, `/compat`, `/trips/new`, `/trips/[tripId]`,
   `/trips/[tripId]/settle`, `/trips/[tripId]/places`

이 저장소에는 테스트 인프라가 없다. 이번 작업은 순수 이동·삭제이고 로직 변경이
없으므로 타입체크 + 빌드 + 육안 확인이 실질 안전망이다. DartGame 분해만 유일하게
코드가 재배치되므로 다트 던지기 인터랙션(조준/눈 가리고 두 모드, 명중/빗나감)을
직접 조작해 확인한다.

## 커밋 분할

리뷰와 되돌리기를 쉽게 하려고 나눈다.

1. `refactor: mock 상태 전환 UI 장치와 QueryOptions 계약 제거`
2. `chore: 사용처 없는 죽은 코드 제거`
3. `refactor: 컴포넌트를 기능 기반 디렉토리로 재배치`
4. `refactor: DartGame을 useDartThrow 훅과 DartBoard로 분리`
5. `docs: 폴더 구조·목데이터 규칙 갱신`

3번은 순수 이동이므로 diff가 크되 내용 변경이 없다. 1·2번과 섞이면 리뷰가 불가능해진다.

## 리스크

- **폴더 이동 중 import 누락** → `pnpm typecheck` 가 전량 잡는다. tsconfig의 `@/` alias를
  쓰므로 상대경로 깨짐은 없다.
- **DartGame 분해 시 동작 회귀** → 자동 테스트가 없어 육안 확인에 의존한다.
  훅 추출 시 로직을 그대로 옮기고 리팩토링 외 개선은 하지 않는다.
