# ROADMAP — 개발 순서 (화면·목데이터 우선)

원칙: **화면부터, mock으로.** 실서버·외부 API는 마지막 페이즈로 미룬다.
각 단계는 빈/로딩/에러/정상 상태를 mock으로 모두 구현하고 끝낸다.

> 이 파일은 자주 바뀌므로 CLAUDE.md에는 넣지 않고 여기서 관리한다.

---

## Phase 0 — 셋업

- [x] Next.js(App Router) + TypeScript(strict) + Tailwind + pnpm 초기화
- [x] ESLint / Prettier / `pnpm typecheck` 스크립트
- [x] `DESIGN_SYSTEM.md`의 토큰을 Tailwind config에 반영 (색·그림자·폰트·라운드)
      — Tailwind v4라 config 파일 대신 `app/globals.css`의 `@theme` 블록. 값은 문서 그대로.
- [x] `lib/data/` 골격: `types.ts`, `repositories.ts`, `mock/`, `index.ts` 스위치
- [x] `mocks/` seed JSON 초안 (유저·여행지 37곳·여행방·지출·맛집·정산결과·퀴즈·궁합)
- [x] `components/ui/` 최소 프리미티브 — Button, Badge, Field(라벨·힌트·에러 래퍼).
      Card는 안 만들었다. 두 갈래의 카드가 공유할 구조가 없어서 각 갈래가 직접 갖는다
      (`dashboard/TripCard`, `boarding-pass/PassCard`).

## Phase 1 — 랜덤 추천 (첫 완성 화면)

- [x] `/random`: 태그 필터 UI (소프트 미니멀) — 테마·예산·계절
- [x] 뽑기/슬롯 인터랙션 → 결과 카드
- [ ] 결과 공유 카드 레이아웃 (mock) — 결과 카드는 있으나 공유 동작은 없음
- [x] 여행지 mock repository 연결

## Phase 2 — 홈 대시보드 + 여행방 생성/참여

- [x] `/` 홈: 내 여행방 리스트 (소프트 미니멀 카드)
- [x] `/trips/new`: 여행방 생성 폼 → mock 저장 + 초대코드 생성
      — 저장은 클라이언트 메모리까지. 새로고침하면 사라진다.
- [x] `/join`: 초대코드 입력 (보딩패스 UI) → 참여
- [x] `components/boarding-pass/` 여행권·초대 카드 (절취선·도장)

## Phase 3 — 여행방 상세 + 정산

- [x] `/trips/[id]`: 멤버·정보·탭 레이아웃 — 멤버/일정/정산 탭.
      일정 탭은 날짜에서 파생한 빈 슬롯뿐이다. 일정 항목 타입이 SPEC §3에 없다.
- [x] 지출 입력 UI (결제자·금액·참여자·카테고리)
- [ ] `lib/settle/` 순수 함수: 엔빵 → 운전자 할인 → 송금 최소화
- [ ] `lib/settle/` 단위 테스트 (SPEC §1.3 예시 고정)
      — `mocks/settlements.json`의 값이 SPEC §1.3 규칙을 `mocks/expenses.json`에
      손으로 적용한 결과다. 그대로 기대값으로 쓸 수 있다.
- [x] `/trips/[id]/settle`: "누가 누구에게 얼마" 결과 화면 — 표시만. 계산은 위 항목.

## Phase 4 — 맛집 · 착한식당

- [x] `/trips/[id]/places`: 목록 + 지도 placeholder (좌표를 정규화해 상대 위치 표시)
- [x] 착한식당 구분 마커/뱃지 (`isChakan`)
- [x] 장소 "찜" → 여행방 후보 목록

## Phase 5 — 여행 궁합

- [x] `/compat`: 퀴즈 8문항
- [ ] 점수 산출 → 궁합 % 결과 (보딩패스 감성 카드)
      — 카드는 있으나 %는 mock 고정값. 답과 무관하다.
- [ ] 결과 공유 카드 (mock 이미지)

## Phase 6 — 실데이터 전환 (나중)

- [ ] Supabase 프로젝트 + 스키마 (types를 테이블로 승격)
- [ ] `lib/data/supabase/` 구현 + `NEXT_PUBLIC_DATA_SOURCE=supabase` 스위치
- [ ] Auth (소셜 로그인) 붙이기
- [ ] Realtime로 여행방/지출 실시간 동기화
- [ ] Kakao Local API + 공공데이터포털 착한가격업소 연동
- [ ] Edge Function: 궁합 공유 카드 이미지 생성

> 전환 시 함께 걷어낼 것: `?state=` 파라미터, `MockStateBar`, `QueryOptions`,
> `lib/data/mock/state.ts`. 화면의 빈/로딩/에러를 보려고 넣은 mock 전용 장치다.

---

### 완료 기준(각 Phase 공통)

- 화면의 빈/로딩/에러/정상 상태가 mock으로 모두 동작
- 데이터는 `lib/data/` 인터페이스 경유
- `pnpm lint` `pnpm typecheck` 통과
- 두 디자인 언어가 화면표 규칙대로 적용됨
