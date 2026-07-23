import type { CompatAxisBreakdown, CompatMember } from '@/lib/data/types'
import { axisGap, gapVerdict } from '@/lib/compat/verdict'

/**
 * 두 사람을 축마다 점 두 개로 찍고 그 사이를 선으로 잇는 아령(dumbbell) 그래프.
 * 읽어야 할 것은 "누가 어디" 가 아니라 "얼마나 벌어졌나" 라서, 선분 길이가 곧 답이 된다.
 *
 * 색으로 두 사람을 구분하지 않는다 — 이 프로젝트 팔레트에는 채도 있는 색이 라임 하나뿐이고,
 * 라임은 흰 배경 위에서 대비가 1.14:1 이라 점으로 쓰면 안 보인다.
 * 대신 '채운 점 / 빈 점' 과 이름 첫 글자로 구분한다. 색각 이상·흑백 인쇄·강제 색상 모드에서도 그대로 읽힌다.
 */
export function CompatAxisChart({
  breakdown,
  members,
}: {
  breakdown: CompatAxisBreakdown[]
  members: [CompatMember, CompatMember]
}) {
  const [left, right] = members

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          어디가 맞고 어디가 다른가
        </h2>
        {/* 두 계열이므로 범례는 항상 둔다. 점 모양이 곧 사람이다. */}
        <ul className="flex items-center gap-3">
          <LegendItem name={left.name} isFilled />
          <LegendItem name={right.name} isFilled={false} />
        </ul>
      </div>

      <ul className="rounded-card border-line bg-surface flex flex-col gap-5 border p-5">
        {breakdown.map((axis) => (
          <li key={axis.axis}>
            <AxisRow axis={axis} members={members} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function LegendItem({ name, isFilled }: { name: string; isFilled: boolean }) {
  return (
    <li className="text-muted flex items-center gap-1.5 text-xs">
      <span
        aria-hidden
        className={`block h-3 w-3 rounded-full ${
          isFilled ? 'bg-ink' : 'border-ink border-2 bg-transparent'
        }`}
      />
      {name}
    </li>
  )
}

function AxisRow({
  axis,
  members,
}: {
  axis: CompatAxisBreakdown
  members: [CompatMember, CompatMember]
}) {
  const [leftPerson, rightPerson] = members
  const gap = axisGap(axis)
  const from = Math.min(axis.left, axis.right)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-sm font-semibold tracking-tight">
          {axis.label}
        </span>
        <span className="text-muted text-xs">{gapVerdict(gap)}</span>
      </div>

      {/* 점이 22px이라 좌우로 11px 여백을 두어야 0·100 위치에서도 트랙을 벗어나지 않는다. */}
      <div className="mt-3 px-[11px]">
        <div className="relative h-[22px]">
          {/* 축: 표면에서 한 단계 들어간 1px 실선 */}
          <span
            aria-hidden
            className="bg-line absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          />
          {/* 벌어진 구간. 이 선분의 길이가 이 행에서 읽어야 할 값이다. */}
          <span
            aria-hidden
            className="bg-ink/25 absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
            style={{ left: `${from}%`, width: `${gap}%` }}
          />
          <Marker
            name={leftPerson.name}
            percent={axis.left}
            axis={axis}
            isFilled
          />
          <Marker
            name={rightPerson.name}
            percent={axis.right}
            axis={axis}
            isFilled={false}
          />
        </div>
      </div>

      <div className="text-muted mt-2 flex justify-between text-xs">
        <span>{axis.leftLabel}</span>
        <span>{axis.rightLabel}</span>
      </div>
    </div>
  )
}

function Marker({
  name,
  percent,
  axis,
  isFilled,
}: {
  name: string
  percent: number
  axis: CompatAxisBreakdown
  isFilled: boolean
}) {
  return (
    <span
      style={{ left: `${percent}%` }}
      /* ring-surface: 두 점이 겹쳐도 서로 잘려 보이지 않게 하는 2px 링 */
      className={`ring-surface absolute top-1/2 flex h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ${
        isFilled
          ? 'bg-ink text-paper'
          : 'border-ink text-ink bg-surface border-2'
      }`}
    >
      <span aria-hidden>{name.slice(0, 1)}</span>
      <span className="sr-only">
        {name}, {axis.label} {percent}점 (0이 {axis.leftLabel}, 100이{' '}
        {axis.rightLabel})
      </span>
    </span>
  )
}
