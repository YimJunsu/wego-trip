/**
 * 군사분계선 근사. [경도, 위도], 경도 오름차순.
 *
 * 정밀 국경이 아니라 "다트가 이북에 꽂혔나"만 가리는 근사다. 지도 데이터에는 남한
 * 시군구만 있어 이북을 판별할 도형이 없기 때문에 선 하나로 대신한다.
 * 시군구 히트 테스트가 먼저 돌기 때문에(DartGame.land) 이 선이 다소 어긋나도
 * 남한 땅이 북한으로 오판되지는 않는다. 육지에 안 걸린 점에만 적용된다.
 */
const MDL: readonly (readonly [number, number])[] = [
  [124.61, 38.08], // 서해 최서단 — 백령도 북쪽 NLL 근사
  [126.24, 37.88], // 한강 하구 · 강화 북단
  [126.55, 37.9], // 개성 남쪽 — 개성은 파주 장단반도보다 북서쪽에 있다
  [126.68, 38.02], // 판문점
  [127.03, 38.28], // 연천 북단
  [127.3, 38.36], // 철원 북방
  [128.0, 38.4], // 양구 · 펀치볼
  [128.37, 38.65], // 고성 동해안
  [129.74, 38.65], // 동해 최동단
]

/** 해당 경도에서 분계선의 위도. 양끝 바깥은 외삽하지 않고 끝점 값을 쓴다. */
function mdlLatAt(lng: number): number {
  const first = MDL[0]
  const last = MDL[MDL.length - 1]
  if (lng <= first[0]) return first[1]
  if (lng >= last[0]) return last[1]

  for (let i = 1; i < MDL.length; i += 1) {
    const [x0, y0] = MDL[i - 1]
    const [x1, y1] = MDL[i]
    if (lng <= x1) return y0 + ((y1 - y0) * (lng - x0)) / (x1 - x0)
  }
  return last[1]
}

/** 분계선보다 북쪽인가. 바다·육지를 가리지 않는다 — "저긴 못 간다"가 전달할 정보다. */
export function isNorthOfMdl(lat: number, lng: number): boolean {
  return lat > mdlLatAt(lng)
}
