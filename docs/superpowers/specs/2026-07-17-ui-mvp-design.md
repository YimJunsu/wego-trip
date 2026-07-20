# UI MVP 설계 — 화면 우선, 로직 제외

작성일: 2026.07.17
범위: `PROJECT_SPEC.md` §2의 화면 8개를 mock 데이터로 완성한다. 도메인 로직(정산 계산, 궁합 점수 산출)은 만들지 않는다.

## 1. 목표와 비목표

**목표**

- 8개 라우트 전부를 실제 프로젝트(`wego-trip`)에 구현한다. 별도 목업 프로젝트를 만들지 않는다.
- 두 디자인 언어(네오브루탈리즘 / 보딩패스)를 `DESIGN_SYSTEM.md` 규칙대로 적용한다.
- 각 화면의 빈/로딩/에러/정상 상태를 모두 확인할 수 있게 한다.
- 화면 내 인터랙션은 동작한다: 필터 토글, 뽑기 애니메이션, 탭 전환, 폼 입력, 퀴즈 진행, 도장 애니메이션.

**비목표**

- `lib/settle/` 정산 순수 함수를 구현하지 않는다. 정산 결과는 seed에 미리 담긴 `Settlement[]`를 그대로 표시한다.
- 궁합 점수 산출 로직을 구현하지 않는다. 결과 %는 mock 고정값이다.
- 서버 저장, 인증, 외부 API를 붙이지 않는다. 폼 제출은 클라이언트 상태까지만 반영한다.

## 2. 기존 문서와의 차이 (의도된 결정)

`ROADMAP.md` Phase 0~5를 화면 관점으로 압축해 한 번에 진행한다. 아래 세 가지는 문서 작성 시점 이후 환경이 달라져 생긴 차이다.

| 항목          | 문서 기준                                | 실제                                 | 결정                                                           |
| ------------- | ---------------------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| Tailwind      | v3 `tailwind.config.js`의 `theme.extend` | v4 설치됨 (config 파일 없음)         | 토큰 값은 `DESIGN_SYSTEM.md` 그대로, 문법만 v4 `@theme`로 이식 |
| 패키지 매니저 | pnpm                                     | npm으로 설치됨 (`package-lock.json`) | `package-lock.json` 삭제 후 `pnpm install`로 lock 재생성       |
| 스크립트      | `pnpm typecheck` / `pnpm format`         | 없음, Prettier 미설치                | Prettier 추가 + 스크립트 추가                                  |

## 3. 기반 (Phase 0)

- **토큰**: `app/globals.css`의 `@theme` 블록에 `DESIGN_SYSTEM.md` §1의 색·`shadow-brut`·`rounded-pass`·폰트를 정의한다. 스타터의 dark-mode 블록은 제거한다 — paper/ink 팔레트와 충돌하고, 이 앱은 라이트 전용이다.
- **폰트**: Archivo(display)·Space Mono(mono)는 `next/font/google`. Pretendard(body)는 Google Fonts에 없으므로 jsdelivr CDN을 `@import`한다. 의존성을 늘리지 않기 위한 선택이다.
- **레이아웃**: 모바일 우선. 데스크탑은 `max-w-*` 중앙 정렬. 친구끼리 여행 중에 쓰는 앱이라 모바일이 기본 사용처다.

## 4. 데이터 계층

`CONVENTIONS.md` §4의 어댑터 패턴을 그대로 따른다. 로직을 제외해도 이 계층은 만든다 — 화면이 repository에만 의존해야 나중에 Supabase로 갈아끼울 때 화면을 안 건드린다.

- `lib/data/types.ts` — `PROJECT_SPEC.md` §3 타입 그대로. 단일 출처.
- `lib/data/repositories.ts` — 인터페이스(계약).
- `lib/data/mock/` — seed JSON을 읽는 구현.
- `lib/data/index.ts` — `NEXT_PUBLIC_DATA_SOURCE` 스위치.
- `mocks/*.json` — 유저·여행지(30~50곳)·여행방·지출·맛집·정산결과·궁합결과 seed.

정산 결과는 계산하지 않고 `mocks/settlements.json`에 `Settlement[]`로 미리 담아 반환한다.

## 5. 상태 4종 데모

각 페이지는 `?state=empty|loading|error` search param을 읽어 repository 호출에 넘긴다.

- `empty` → 빈 배열/`null` 반환
- `loading` → 3초 지연 (Suspense fallback 확인용)
- `error` → throw (error boundary 확인용)
- param 없음 → 정상 데이터

로직 없이 네 상태를 전부 눈으로 확인할 수 있다. mock 전용 장치이므로 Supabase 전환 시 제거한다.

## 6. 컴포넌트

`DESIGN_SYSTEM.md` §4의 배치 규칙을 따른다. 한 화면에서 두 언어를 섞지 않는다.

- `components/ui/` — Button, Card, Input, Badge (중립 프리미티브)
- `components/brutalist/` — TripCard, FilterChip, SlotMachine, ExpenseRow, SettleRow, PlaceCard, TabBar
- `components/boarding-pass/` — PassCard(절취 노치), InviteCodeInput, Stamp, CompatResultCard

한 파일 한 책임. 200줄 넘으면 쪼갠다.

## 7. 화면 8개

`PROJECT_SPEC.md` §2 표의 우선순위·디자인 갈래를 따른다.

| 라우트                   | 화면          | 갈래       | 인터랙션                                 |
| ------------------------ | ------------- | ---------- | ---------------------------------------- |
| `/`                      | 홈/대시보드   | 브루탈리즘 | 여행방 카드 진입                         |
| `/random`                | 랜덤 추천     | 브루탈리즘 | 필터 토글, 뽑기 애니메이션 → 결과 카드   |
| `/trips/new`             | 여행방 생성   | 브루탈리즘 | 폼 입력 → 초대코드 표시                  |
| `/join`                  | 초대코드 참여 | 보딩패스   | 코드 입력 → 도장 애니메이션              |
| `/trips/[tripId]`        | 여행방 상세   | 브루탈리즘 | 탭 전환(멤버/일정/정산)                  |
| `/trips/[tripId]/settle` | 정산          | 브루탈리즘 | 지출 목록, 송금 리스트 표시(mock)        |
| `/trips/[tripId]/places` | 맛집·착한식당 | 브루탈리즘 | 지도 placeholder, 착한식당 뱃지, 찜 토글 |
| `/compat`                | 궁합 퀴즈     | 보딩패스   | 문항 진행 → 결과 카드(mock %)            |

## 8. 완료 기준

- 8개 화면이 빈/로딩/에러/정상 상태로 동작
- 데이터는 `lib/data/` 인터페이스 경유, UI에 mock 직접 박지 않음
- 하드코딩 색/px 없음, 토큰만 사용
- `pnpm lint` `pnpm typecheck` 통과
