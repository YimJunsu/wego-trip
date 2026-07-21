import type { BudgetLevel, DestinationTheme, Season } from '@/lib/data/types'

export const THEME_LABEL: Record<DestinationTheme, string> = {
  sea: '바다',
  mountain: '산',
  city: '도시',
  healing: '힐링',
  activity: '액티비티',
}

export const BUDGET_LABEL: Record<BudgetLevel, string> = {
  low: '알뜰',
  mid: '보통',
  high: '플렉스',
}

export const SEASON_LABEL: Record<Season, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
}

export const THEME_ORDER: readonly DestinationTheme[] = [
  'sea',
  'mountain',
  'city',
  'healing',
  'activity',
]

export const BUDGET_ORDER: readonly BudgetLevel[] = ['low', 'mid', 'high']

export const SEASON_ORDER: readonly Season[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
]

/**
 * 지도 데이터(korea-sigungu.json)는 시도 정식 명칭을, 여행지 데이터는 축약 키를 쓴다.
 * 둘을 잇는 유일한 표. 표에 없는 값이 들어오면 여행지 조회를 건너뛴다.
 */
export const PROVINCE_TO_REGION: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
}

/**
 * 테마 뱃지는 중립 pill이다. 강조색은 라임 하나뿐이라 테마마다 색을 주지 않는다.
 * 어차피 색만으로 정보를 전달하면 안 되므로, 구분은 라벨이 한다. (DESIGN_SYSTEM §4)
 */
export const THEME_PILL = 'bg-ink/5 text-ink'
