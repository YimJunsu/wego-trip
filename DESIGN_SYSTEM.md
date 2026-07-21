# DESIGN_SYSTEM — 디자인 시스템

이 앱은 **두 개의 시각 언어**를 의도적으로 대비시킨다. 섞지 않는다.

- **대시보드/기능 영역 = 소프트 미니멀** — 부드럽고, 여백이 넉넉하고, 라임 하나로 강조.
- **초대·여행권·궁합 결과 = 보딩패스** — 종이 티켓, 절취선, 도장, 여행 감성.

경계 규칙: 앱을 "쓰는" 곳은 소프트 미니멀, 여행을 "떠나는/공유하는" 순간은 보딩패스.

타깃은 20–30대. 밝은 미색 바탕에 라임 포인트, 둥근 카드, 사진 아바타로 "요즘 앱" 인상을 준다.

---

## 1. 공통 토큰 (Tailwind v4 `@theme`, 원본은 `app/globals.css`)

```
colors:
  ink:      #101010   # 기본 텍스트 (순수 검정 아님)
  muted:    #6F6F68   # 보조 텍스트
  paper:    #F4F4EF   # 배경 (미색 종이)
  surface:  #FFFFFF   # 카드 표면
  line:     #E6E6DF   # 1px 경계선

  # 강조색은 라임 하나뿐. 색을 늘리기 전에 명도·여백으로 먼저 푼다.
  lime:      #DCFB53
  lime-soft: #EEFCAE

  # 기능색. 강조가 아니라 상태(위험)를 알리는 용도.
  danger:   #C8372D

  # 보딩패스 팔레트 (차분한 여행 톤)
  pass-navy:   #1B2A4A
  pass-cream:  #F3ECDD
  pass-stamp:  #C1440E   # 도장 잉크
  pass-line:   #9B8F76   # 절취선

radius:
  card:   1.75rem       # 대시보드 큰 카드
  inner:  1.25rem       # 카드 안쪽 요소
  pass:   14px          # 보딩패스 카드 모서리

shadow:
  soft:  0 18px 40px -18px rgba(16,16,16,0.14)   # 넓게 퍼지는 옅은 그림자
  lift:  0 24px 50px -18px rgba(16,16,16,0.2)    # hover 시 살짝 더 뜬다

fontFamily:
  display: ['"Outfit"', 'sans-serif']     # 헤드라인·UI (기하학적 산세리프)
  body:    ['"Pretendard Variable"', 'sans-serif']  # 한글 본문
  mono:    ['"Space Mono"', 'monospace']  # 코드·좌석번호·날짜
```

- 한글 본문은 Pretendard(국내 가독성). 헤드라인·UI는 Outfit — 넓고 둥근 산세리프.
- 폰트·색은 반드시 토큰으로. 컴포넌트에 hex 직접 쓰지 않는다.
- 강조색은 **라임 하나**. 원색을 여러 개 쓰지 않는다. 구분이 필요하면 명도·라벨로.

---

## 2. 소프트 미니멀 (대시보드)

원칙: 미색 바탕, 흰 카드, 크고 둥근 모서리, 넓게 퍼지는 옅은 그림자, 라임 하나로 포인트.

- 배경: `bg-paper`. 카드: `bg-surface`, `rounded-card`, `border-line`, `shadow-soft`.
- 강조 블록(홈 히어로·정산 총액)만 `bg-lime`. 나머지는 흰 표면·중립 pill.
- 버튼: 알약형(`rounded-full`). 주요=`bg-ink text-paper`, 강조=`bg-lime text-ink`, 보조=`border-line`.
- 아이콘: `@phosphor-icons/react`. 이모지는 UI에 쓰지 않는다(여행지 표정은 예외).
- 아바타: 사진(`next/image`) 또는 이니셜 폴백. 그룹은 겹쳐 놓는다.
- 상태색: 위험만 `danger`. 성공·선택은 라임·먹색으로.
- 목록은 카드를 남발하기보다 `divide-line`으로 구분선 처리.

버튼 예시:

```tsx
<button
  className="bg-ink text-paper rounded-full px-5 py-2.5 font-display font-semibold
  transition duration-200 ease-out active:scale-[0.98]"
>
  여행지 뽑기
</button>
```

카드 예시:

```tsx
<div className="bg-surface rounded-card border-line shadow-soft border p-6">
  <h3 className="font-display text-xl font-semibold tracking-tight">부산 광안리</h3>
  <span className="bg-ink/5 text-ink rounded-full px-2.5 py-1 text-xs">바다</span>
</div>
```

do: 넉넉한 여백, 둥근 카드, 옅은 그림자, 라임 포인트, 사진 아바타, 구분선.
don't: 원색 여러 개, 두꺼운 검은 테두리, 하드 오프셋 그림자, 각진 모서리, 이모지 UI.

---

## 3. 보딩패스 (초대 · 여행권 · 궁합 결과)

원칙: 항공권/티켓 메타포. 절취선, 좌석·게이트 스타일 라벨, 도장, 모노스페이스 코드.

- 카드: `bg-pass-cream`, `rounded-pass`, 얇은 실선 테두리 `border-pass-line`.
- 절취선: 점선 `border-dashed border-pass-line`. 좌우 원형 노치(구멍)로 티켓 느낌.
- 초대코드: `font-mono` 대문자, 자간 넓게, 좌석번호처럼 배치.
- 도장(참여/확정): 회전된 스탬프 텍스트, `pass-stamp` 색, 반투명.
- 라벨은 항공권 용어 차용: `FROM / TO`, `GATE`, `SEAT`, `BOARDING`, `CODE`.

여행권/초대 카드 예시:

```tsx
<div className="bg-pass-cream rounded-pass border-pass-line text-pass-navy relative border p-6 font-mono">
  <div className="flex justify-between text-xs tracking-widest">
    <span>FROM · 서울</span>
    <span>TO · 강릉</span>
  </div>
  <div className="border-pass-line my-4 border-t border-dashed" />
  <div className="text-xs tracking-widest opacity-70">INVITE CODE</div>
  <div className="text-3xl tracking-[0.3em]">K7X9Q2</div>
  {/* 좌우 절취 노치는 before/after 원형으로 */}
</div>
```

절취 노치(참고): 카드 좌우 중앙에 `paper` 색 원을 `absolute`로 반쯤 걸쳐 티켓 구멍 효과.

do: 종이 질감(미색), 점선 절취, 모노스페이스, 도장, 여백 여유.
don't: 라임 강조·소프트 카드(그건 대시보드용). 여긴 종이 톤으로 차분하게.

---

## 4. 컴포넌트 배치 규칙

| 위치                 | 폴더                        | 언어                                   |
| -------------------- | --------------------------- | -------------------------------------- |
| 공통 프리미티브      | `components/ui/`            | 중립(양쪽에서 재사용 가능한 최소 단위) |
| 대시보드·기능        | `components/dashboard/`     | 소프트 미니멀                          |
| 초대·여행권·궁합결과 | `components/boarding-pass/` | 보딩패스                               |

- 한 화면 안에서 두 언어를 섞지 않는다. `PROJECT_SPEC.md` §2 화면표의 "디자인 갈래"를 따른다.
- 접근성: 색만으로 정보 전달 금지(라벨 병기). 명도 대비 확보. 포커스 링 유지.

## 5. 마이크로 인터랙션

- 소프트 미니멀 버튼: 누르면 살짝 눌리는 `active:scale-[0.98]`. 카드 hover는 `-translate-y` + `shadow-lift`.
- 목록·그리드: 순서대로 올라오는 `animate-rise`(index로 지연). 한 번에 튀어나오지 않는다.
- 랜덤 뽑기: 라임 슬롯이 돌다 멈추며 결과 카드가 `animate-rise`로 등장.
- 보딩패스: 참여 확정 시 도장이 쿵 찍히는 `animate-stamp`.
- 과하지 않게. 모션 최소 200~300ms, `prefers-reduced-motion` 존중. 라이브러리 없이 CSS로만.
- 다트 던지기: 바람은 던지기 전에 보여주고(보정 가능), 착지 산포는 숨긴다. 궤적이 바람 쪽으로 휜다.
  `prefers-reduced-motion`이면 애니메이션만 끄고 착지 계산은 같다 — 모션 설정으로 난이도가 달라지면 안 된다.

---

## 6. 지도 팔레트 (일러스트 예외)

§1은 "강조색은 라임 하나"를 못박는다. 지도는 그 예외다.

**왜 예외인가.** 지도는 UI 크롬이 아니라 콘텐츠다. 버튼이나 배지처럼 "누를 수 있음"을 알리는 색이 아니라, 바다와 산을 그리는 그림의 색이다. 여기까지 먹색 명도로 누르면 한반도가 회색 얼룩으로 읽힌다.

**범위는 지도 svg 안뿐이다.** 이 토큰들은 `KoreaMapLayer` 밖에서 쓰지 않는다. 버튼·카드·배지·칩은 여전히 라임 하나다.

```
terrain-sea       옅은 청록 회색   바다
terrain-sea-deep  한 단계 짙게     먼바다 (아래로 갈수록)
terrain-low       연한 미색 녹     평야
terrain-mid       세이지           구릉
terrain-high      짙은 올리브      산지
```

- 전부 채도를 낮췄다. 미색 배경(`paper`)과 붙고, 라임과 다투지 않는다.
- **명중한 지역은 여전히 `fill-lime`.** 차분한 자연색 위라서 오히려 더 튄다. 강조는 지도에서도 라임 하나라는 원칙이 지켜진다.
- 고도 등급은 `lib/geo/terrain.ts`가 정한다. 지도 데이터에 고도가 없어 산맥 라인을 손으로 지정한 **일러스트용 근사**다. 정밀 고도가 아니다.
- 접근성: 등급을 색으로만 알리지 않는다. 지형은 장식이고, 결과는 지역명·좌표로 읽힌다.
