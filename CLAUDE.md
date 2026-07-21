# CLAUDE.md

> 이 파일은 Claude Code가 **매 세션 시작 시** 읽는 운영 매뉴얼입니다.
> 짧고 안정적으로 유지하고, 상세 내용은 `docs/`를 참조합니다.
> 규칙을 반복해서 교정하게 되면 여기에 한 줄로 적어 고정하세요.

## 프로젝트 한 줄 요약

친구들과 **국내 여행**을 계획·정산하는 웹앱. 랜덤 여행지 추천, 초대코드 기반 여행방, 엔빵 정산(운전자 할인 포함), 근처 맛집·착한식당, 여행 궁합.

## 지금 단계 (중요)

**목데이터 + 화면 우선.** 실제 백엔드(Supabase)·외부 API는 나중에 붙입니다.

- 모든 데이터는 `lib/data/`의 mock 구현으로만 흐른다. Supabase / Kakao API 직접 호출 코드를 지금 작성하지 않는다.
- 데이터 접근은 반드시 repository 인터페이스를 거친다. UI가 mock인지 실서버인지 몰라야 한다.
- "화면부터, 인터랙션부터." 로직은 UI가 요구하는 만큼만 만든다.

## 기술 스택

- Next.js (App Router) · TypeScript (strict) · Tailwind CSS
- 패키지 매니저: **pnpm** (npm/yarn 금지)
- 상태: 서버 컴포넌트 우선, 클라이언트 상태 최소화 (필요 시 Zustand)
- 데이터: 지금은 mock, 이후 Supabase (Auth / Postgres / Realtime / Edge Functions)

## 항상 지킬 것

- 새 기능은 `docs/CONVENTIONS.md`의 폴더 구조·네이밍을 따른다.
- 통화는 원(₩), 날짜는 국내 포맷(`YYYY.MM.DD`), 지역·여행지는 **국내 한정**.
- 디자인은 두 갈래다: **대시보드 = 소프트 미니멀(라임 강조)**, **초대·여행권 = 보딩패스**. 섞지 말 것. (`docs/DESIGN_SYSTEM.md`)
- 하드코딩된 색·간격 금지. Tailwind 토큰/유틸만 사용.
- 컴포넌트는 작게. 한 파일 한 책임.
- 작업 완료 보고 전 `pnpm lint` 와 `pnpm typecheck` 를 통과시킨다.

## 하지 말 것

- 실제 API 키·시크릿을 코드/커밋에 넣지 않는다.
- `any` 타입 남발 금지. 불가피하면 `// TODO(type):` 주석.
- 요청하지 않은 대규모 리팩터·의존성 추가 금지. 먼저 제안하고 확인받는다.
- mock 데이터를 UI 컴포넌트 안에 직접 박지 않는다. 항상 `lib/data/`를 거친다.

## 자주 쓰는 명령어

```bash
pnpm dev         # 개발 서버
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm format      # Prettier
```

## 상세 문서 (필요할 때 열기)

- 제품·기능·데이터 모델 → @docs/PROJECT_SPEC.md
- 코딩·폴더·목데이터·협업 규칙 → @docs/CONVENTIONS.md
- 디자인 시스템(소프트 미니멀 + 보딩패스) → @docs/DESIGN_SYSTEM.md
- 개발 순서 체크리스트 → @docs/ROADMAP.md

## 협업 메모

- 커밋: Conventional Commits (`feat:`, `fix:` …)
- PR은 작게, `main` 별도의 지시 있지 전까지 커밋, 푸시 금지. PR 리뷰 1인 이상.
