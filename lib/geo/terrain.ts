/**
 * 시군구 지형 등급. 지도 채색에만 쓴다.
 *
 * 지도 데이터(korea-sigungu.json)는 통계청 행정구역 경계라 고도 정보가 없다.
 * 그래서 태백·소백·노령산맥과 지리산권 시군구를 손으로 골라 등급을 매겼다.
 * **정밀 고도가 아니라 일러스트용 근사다.** 동쪽이 높고 서쪽이 낮은 경동성 지형이
 * 드러나는 정도면 충분하다.
 *
 * 나중에 실제 고도 데이터를 붙이면 이 파일만 갈아끼운다 — 소비하는 쪽은 등급만 안다.
 *
 * '고성군'이 강원·경남에 모두 있어 이름만으로는 구분되지 않는다. 시도와 함께 찾는다.
 */

export type TerrainGrade = 'low' | 'mid' | 'high'

/** 산지. 산맥 능선이 지나는 시군구. */
const HIGH: Record<string, readonly string[]> = {
  강원특별자치도: [
    '태백시',
    '영월군',
    '평창군',
    '정선군',
    '화천군',
    '양구군',
    '인제군',
    '홍천군',
  ],
  경상북도: ['봉화군', '영양군', '청송군', '문경시'],
  충청북도: ['단양군'],
  전북특별자치도: ['무주군', '진안군', '장수군'],
  경상남도: ['함양군', '거창군', '산청군'],
  경기도: ['가평군'],
}

/** 구릉. 산지 주변과 내륙 고지대. */
const MID: Record<string, readonly string[]> = {
  강원특별자치도: [
    '춘천시',
    '원주시',
    '강릉시',
    '동해시',
    '속초시',
    '삼척시',
    '횡성군',
    '철원군',
    '고성군',
    '양양군',
  ],
  경상북도: [
    '안동시',
    '영주시',
    '상주시',
    '예천군',
    '의성군',
    '군위군',
    '청도군',
    '영덕군',
    '울진군',
  ],
  충청북도: ['제천시', '충주시', '괴산군', '보은군', '옥천군', '영동군'],
  전북특별자치도: ['남원시', '임실군', '순창군', '완주군'],
  전라남도: [
    '구례군',
    '곡성군',
    '화순군',
    '담양군',
    '장성군',
    '보성군',
    '장흥군',
  ],
  경상남도: ['하동군', '합천군', '밀양시', '의령군', '창녕군', '함안군'],
  경기도: [
    '양평군',
    '포천시',
    '연천군',
    '광주시',
    '여주시',
    '남양주시',
    '안성시',
    '이천시',
  ],
  제주특별자치도: ['제주시', '서귀포시'],
  울산광역시: ['울주군'],
  대구광역시: ['달성군'],
}

function toKeySet(source: Record<string, readonly string[]>): Set<string> {
  const set = new Set<string>()
  for (const [province, names] of Object.entries(source)) {
    for (const name of names) set.add(`${province}|${name}`)
  }
  return set
}

const HIGH_KEYS = toKeySet(HIGH)
const MID_KEYS = toKeySet(MID)

export function terrainGrade(province: string, name: string): TerrainGrade {
  const key = `${province}|${name}`
  if (HIGH_KEYS.has(key)) return 'high'
  if (MID_KEYS.has(key)) return 'mid'
  return 'low'
}
