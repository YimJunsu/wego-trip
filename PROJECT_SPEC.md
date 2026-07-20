# PROJECT_SPEC — 제품 스펙

친구들과 국내 여행을 계획·정산하는 웹앱. 이 문서는 "무엇을 만드는가"를 정의합니다.
"어떻게 만드는가"는 `CONVENTIONS.md`, "어떻게 보이는가"는 `DESIGN_SYSTEM.md` 참조.

---

## 1. 핵심 기능

### 1.1 랜덤 여행지 추천

- 태그 필터(테마: 바다/산/도시/힐링/액티비티 · 예산대 · 계절) 후 그 안에서 랜덤 추출.
- 뽑기/슬롯머신 인터랙션으로 "뽑는 순간"을 이벤트화. 결과 카드 공유 가능.
- 국내 여행지만 다룬다. 초기 mock 데이터 30~50곳.

### 1.2 친구 여행방 + 초대

- 방장이 여행방 생성 → **6자리 영문+숫자 초대코드** 발급.
- 친구가 코드 입력으로 참여. (보딩패스 UI — `DESIGN_SYSTEM.md`)
- 멤버 목록, 여행 기본 정보(목적지·기간). 실시간 동기화는 이후 Supabase Realtime.

### 1.3 정산 (엔빵) — 핵심 로직

지출을 넣으면 "누가 누구에게 얼마" 송금 리스트가 나온다. 3단계 규칙:

1. **기본 엔빵**: 각 지출은 참여자에게 균등 분배. 각자 부담 = Σ(참여한 지출 ÷ 참여 인원).
2. **운전자 할인**: 운전자의 부담분을 설정 비율(기본 20%)만큼 감면하고, 감면액을 나머지 인원이 균등 부담. (대안: 기름값 정액 크레딧 방식 — 옵션)
3. **송금 최소화**: 채무자↔채권자를 그리디로 매칭해 송금 횟수를 최소화.

> 정산 계산 함수는 순수 함수로 분리(`lib/settle/`)하고 단위 테스트를 붙인다. UI·데이터와 독립.

**정산 규칙 예시 (검증용)**

- 4명(A,B,C,D), A가 운전자. 총 지출 40,000원을 A가 결제, 4명 균등.
- 기본: 각 10,000원. A는 30,000 받을 것.
- 운전자 할인 20%: A 부담 10,000 → 8,000 (2,000 감면). 감면분 2,000을 B·C·D가 분담(각 +666.67).
- 결과: B·C·D 각 10,666.67원을 A에게. (반올림 규칙은 CONVENTIONS 참고)

### 1.4 근처 맛집 · 착한식당

- 일반 맛집: 이후 Kakao Local API. 지금은 mock 리스트 + 지도 자리(placeholder).
- 착한식당: 이후 공공데이터포털 '착한가격업소'. mock에선 `isChakan: true` 플래그로 구분 마커.
- 장소를 여행방에 "찜"해서 후보 목록으로.

### 1.5 여행 궁합

- 여행 스타일 퀴즈 6~8문항(계획형↔즉흥형, 아침형↔올빼미, 액티비티↔휴식, 예산 성향 등).
- 두 명 또는 그룹 궁합 % 산출. 결과는 공유 카드 이미지. (이미지 생성은 이후 Edge Function)

---

## 2. 화면 목록 (우선순위 순)

| 순위 | 라우트               | 화면                               | 디자인 갈래        |
| ---- | -------------------- | ---------------------------------- | ------------------ |
| 1    | `/`                  | 홈/대시보드 (내 여행방, 빠른 진입) | 소프트 미니멀       |
| 2    | `/random`            | 랜덤 추천 (필터 + 뽑기 + 결과카드) | 소프트 미니멀       |
| 3    | `/trips/new`         | 여행방 생성                        | 소프트 미니멀       |
| 4    | `/join`              | 초대코드 입력 → 참여               | 보딩패스           |
| 5    | `/trips/[id]`        | 여행방 상세 (멤버·일정·정산 탭)    | 소프트 미니멀       |
| 6    | `/trips/[id]/settle` | 정산 화면                          | 소프트 미니멀       |
| 7    | `/trips/[id]/places` | 맛집·착한식당 지도/목록            | 소프트 미니멀       |
| 8    | `/compat`            | 궁합 퀴즈 → 결과 → 공유            | 보딩패스 감성 카드 |

각 화면은 **빈/로딩/에러/정상** 상태를 모두 mock으로 구현한다.

---

## 3. 데이터 모델 (mock 기준, 이후 Supabase 테이블로 승격)

TypeScript 타입은 `lib/data/types.ts`가 단일 출처(single source of truth).

```ts
type Profile = {
  id: string
  nickname: string
  avatarUrl?: string
  travelStyle?: QuizResult
}
type Trip = {
  id: string
  name: string
  region: string
  startDate: string
  endDate: string
  inviteCode: string
  createdBy: string
  coverTheme: string
}
type Member = {
  tripId: string
  userId: string
  role: 'host' | 'member'
  isDriver: boolean
}
type Expense = {
  id: string
  tripId: string
  payerId: string
  amount: number
  description: string
  category: string
  participantIds: string[]
  createdAt: string
}
type Place = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  isChakan: boolean
  savedToTripId?: string
}
type QuizResult = {
  userId: string
  answers: number[]
  scores: Record<string, number>
}
type Settlement = { from: string; to: string; amount: number } // 계산 결과, 저장 안 함
```

- 통화 단위: 정수 원(₩). 소수 계산 후 최종 표기 시 반올림.
- id는 mock에서 `nanoid`/문자열. Supabase 이관 시 uuid.

---

## 4. 목데이터 → 실서버 전환 전략

- UI·컴포넌트는 오직 `lib/data/`의 repository 인터페이스에만 의존한다.
- 지금은 `lib/data/mock/`가 인터페이스를 구현(메모리/JSON seed).
- 이후 `lib/data/supabase/`를 같은 인터페이스로 추가하고, `NEXT_PUBLIC_DATA_SOURCE` 로 스위치.
- 즉 화면을 다시 짜지 않고 데이터 소스만 갈아끼운다. (상세: `CONVENTIONS.md` §목데이터)

---

## 5. 범위 밖 (지금 하지 않음)

- 실제 로그인/인증 연동 (mock 유저로 대체)
- 결제·송금 실제 연동 (금액 계산·표시까지만)
- 푸시 알림, 이메일
- 해외 여행지
