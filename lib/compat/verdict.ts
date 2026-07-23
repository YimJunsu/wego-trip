import type { CompatAxisBreakdown } from '@/lib/data/types'

/**
 * 두 사람이 한 축에서 얼마나 벌어졌는지. 0~100.
 * 그래프에서 두 점을 잇는 선분의 길이가 그대로 이 값이다.
 */
export function axisGap(axis: CompatAxisBreakdown): number {
  return Math.abs(axis.left - axis.right)
}

/**
 * 벌어진 정도를 말로 옮긴다. 숫자보다 이쪽이 먼저 읽힌다.
 * 경계값은 seed 데이터를 눈으로 확인하고 정했다 — 20까지는 사실상 같은 자리다.
 */
export function gapVerdict(gap: number): string {
  if (gap <= 20) return '거의 같음'
  if (gap <= 45) return '조금 다름'
  return '많이 다름'
}

/** 가장 크게 갈린 축. 결과 요약에서 "여기만 조심하면 된다"를 짚어 준다. */
export function widestAxis(
  breakdown: CompatAxisBreakdown[],
): CompatAxisBreakdown | null {
  if (breakdown.length === 0) return null
  return breakdown.reduce((worst, axis) =>
    axisGap(axis) > axisGap(worst) ? axis : worst,
  )
}
