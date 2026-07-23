import { Avatar } from '@/components/ui/Avatar'
import type { CompatResult } from '@/lib/data/types'
import { axisGap, gapVerdict, widestAxis } from '@/lib/compat/verdict'
import { withJosa } from '@/lib/utils/josa'

/**
 * 결과의 얼굴. 퍼센트 하나가 주인공이라 차트로 만들지 않고 큰 숫자로 둔다.
 * (한 화면에 대표 숫자는 하나뿐이다.)
 */
export function CompatResultHero({ result }: { result: CompatResult }) {
  const [left, right] = result.members

  return (
    <section className="rounded-card border-line bg-surface shadow-soft animate-rise border p-6 text-center sm:p-8">
      <div className="flex items-center justify-center gap-3">
        <Person name={left.name} />
        <span className="text-muted text-sm">×</span>
        <Person name={right.name} />
      </div>

      {/* 대표 숫자. tabular-nums를 쓰지 않는다 — 큰 글자에서 자간이 벌어져 보인다. */}
      <p className="font-display mt-6 text-6xl leading-none font-semibold tracking-tight">
        {result.percent}
        <span className="text-muted text-3xl">%</span>
      </p>
      <p className="font-display mt-3 text-2xl font-semibold tracking-tight">
        {result.headline}
      </p>
    </section>
  )
}

function Person({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium">
      <Avatar name={name} size="sm" />
      {name}
    </span>
  )
}

/** 읽는 부분. 총평과, 제일 갈린 축 하나를 짚어 준다. */
export function CompatNotes({ result }: { result: CompatResult }) {
  const worst = widestAxis(result.breakdown)

  return (
    <section className="flex flex-col gap-3">
      <Panel title="이 조합은">
        <p className="text-sm leading-relaxed">{result.description}</p>
      </Panel>

      {worst && (
        <Panel title="여기만 맞추면 됩니다">
          <p className="text-sm leading-relaxed">
            {withJosa(worst.label, '이/가')} 제일 갈립니다(
            {gapVerdict(axisGap(worst))}). {withJosa(worst.leftLabel, '과/와')}{' '}
            {withJosa(worst.rightLabel, '이/가')} 부딪히는 구간은 따로 움직이고
            나머지를 같이 쓰면 됩니다.
          </p>
        </Panel>
      )}
    </section>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-card border-line bg-surface border p-5">
      <h3 className="font-display text-sm font-semibold tracking-tight">
        {title}
      </h3>
      <div className="text-muted mt-2">{children}</div>
    </div>
  )
}
