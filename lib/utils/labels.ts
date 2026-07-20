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
 * 테마 뱃지는 중립 pill이다. 강조색은 라임 하나뿐이라 테마마다 색을 주지 않는다.
 * 어차피 색만으로 정보를 전달하면 안 되므로, 구분은 라벨이 한다. (DESIGN_SYSTEM §4)
 */
export const THEME_PILL = 'bg-ink/5 text-ink'
