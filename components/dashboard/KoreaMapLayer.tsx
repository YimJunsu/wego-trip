import { koreaMap } from '@/lib/geo/koreaMap'
import { cn } from '@/lib/utils/cn'

/**
 * 시군구 지도 레이어. DartGame의 svg 안에서 쓴다.
 * 색은 늘리지 않고 먹색 명도 4단계로 시도를 구분한다. (DESIGN_SYSTEM §1)
 * 인접 시도끼리 같은 명도가 붙지 않도록 손으로 배정했다.
 */
const TINT = [
  'fill-ink/5',
  'fill-ink/9',
  'fill-ink/14',
  'fill-ink/20',
] as const

const PROVINCE_TINT: Record<string, number> = {
  11: 0, // 서울
  21: 3, // 부산
  22: 0, // 대구
  23: 0, // 인천
  24: 0, // 광주
  25: 0, // 대전
  26: 0, // 울산
  29: 2, // 세종
  31: 2, // 경기
  32: 1, // 강원
  33: 3, // 충북
  34: 1, // 충남
  35: 0, // 전북
  36: 2, // 전남
  37: 2, // 경북
  38: 1, // 경남
  39: 1, // 제주
}

export function KoreaMapLayer({
  highlightCode,
}: {
  highlightCode?: string | null
}) {
  return (
    <g>
      {koreaMap.regions.map((region) => {
        const isHit = region.code === highlightCode
        return (
          <path
            key={region.code}
            d={region.path}
            className={cn(
              'stroke-surface transition-[fill] duration-300',
              isHit
                ? 'fill-lime'
                : TINT[PROVINCE_TINT[region.code.slice(0, 2)] ?? 0],
            )}
            strokeWidth={1}
          />
        )
      })}

      {/* 울릉도·독도 인셋. 본토에서 떨어져 있어 박스로 옮겨 그린다. */}
      {koreaMap.insets.map((inset) => (
        <g key={inset.label}>
          <rect
            x={inset.x}
            y={inset.y}
            width={inset.w}
            height={inset.h}
            rx={10}
            strokeDasharray="4 4"
            className="stroke-line fill-none"
          />
          <text
            x={inset.x + inset.w / 2}
            y={inset.y + inset.h + 14}
            textAnchor="middle"
            className="fill-muted font-mono text-[11px]"
          >
            {inset.label}
          </text>
        </g>
      ))}
    </g>
  )
}
