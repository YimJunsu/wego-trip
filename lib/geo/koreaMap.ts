import data from './korea-sigungu.json'

/**
 * 대한민국 시군구 다트 맵 데이터 접근자.
 * 원본은 scripts/build-korea-map.mjs가 생성한 korea-sigungu.json — 손으로 고치지 않는다.
 */

export type SigunguRegion = {
  /** 통계청 행정구역 코드. 앞 두 자리가 시도. */
  code: string
  name: string
  province: string
  /** 지도 svg 좌표계의 path. 울릉군은 인셋 박스 안에 그려진다. */
  path: string
  /** [위도, 경도] — 실제 지리 중심. 결과 카드 좌표 표기용. */
  centroid: [number, number]
  /** 지도 svg 좌표계의 대표점. 핀 표시·눈 가리고 착지에 쓴다. */
  anchor: [number, number]
}

type KoreaMapInset = {
  label: string
  x: number
  y: number
  w: number
  h: number
}

type Projection = {
  minLon: number
  maxLat: number
  kx: number
  ky: number
  offsetX: number
  offsetY: number
}

type KoreaMapData = {
  width: number
  height: number
  /** 지도 아래 다트 대기 공간(바다)의 높이 */
  dock: number
  proj: Projection
  insets: KoreaMapInset[]
  regions: SigunguRegion[]
}

export const koreaMap = data as unknown as KoreaMapData

/** svg 좌표 → [위도, 경도]. 다트가 꽂힌 지점의 좌표 표기에 쓴다. */
export function unprojectPoint(x: number, y: number): [number, number] {
  const { minLon, maxLat, kx, ky, offsetX, offsetY } = koreaMap.proj
  const lat = maxLat - (y - offsetY) / ky
  const lng = (x - offsetX) / kx + minLon
  return [Math.round(lat * 1000) / 1000, Math.round(lng * 1000) / 1000]
}
