import { PassCard, PassTear } from '@/components/boarding-pass/PassCard'
import { Stamp } from '@/components/boarding-pass/Stamp'
import { Avatar } from '@/components/ui/Avatar'
import type {
  CompatAxisBreakdown,
  CompatResult,
  Profile,
} from '@/lib/data/types'

export function CompatResultCard({ result }: { result: CompatResult }) {
  const [left, right] = result.members

  return (
    <PassCard className="p-6">
      <div className="flex justify-between text-xs tracking-widest">
        <span>TRAVEL MATCH</span>
        <span>KR · 2026</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-6xl tracking-tight">{result.percent}%</p>
          <p className="mt-1 text-lg">{result.headline}</p>
        </div>
        <Stamp label="MATCHED" isAnimated />
      </div>

      <PassTear />

      <div className="flex items-center justify-center gap-3 text-sm">
        <Person profile={left} />
        <span className="opacity-50">×</span>
        <Person profile={right} />
      </div>

      <p className="font-body mt-4 text-sm leading-relaxed opacity-90">
        {result.description}
      </p>

      <PassTear />

      <ul className="flex flex-col gap-4">
        {result.breakdown.map((axis) => (
          <li key={axis.axis}>
            <AxisBar axis={axis} />
          </li>
        ))}
      </ul>
    </PassCard>
  )
}

function Person({ profile }: { profile: Profile }) {
  return (
    <span className="flex items-center gap-1.5">
      <Avatar name={profile.nickname} src={profile.avatarUrl} size="sm" />
      {profile.nickname}
    </span>
  )
}

function AxisBar({ axis }: { axis: CompatAxisBreakdown }) {
  return (
    <div>
      <div className="flex justify-between text-xs tracking-widest opacity-70">
        <span>{axis.leftLabel}</span>
        <span>{axis.label}</span>
        <span>{axis.rightLabel}</span>
      </div>
      <div className="border-pass-line bg-paper relative mt-2 h-6 rounded-full border">
        {/* 두 사람의 위치는 도장색·남색 점으로 구분한다. 얇은 트랙엔 사진보다 점이 낫다. */}
        <Marker
          percent={axis.left}
          tone="bg-pass-navy"
          label={axis.leftLabel}
        />
        <Marker
          percent={axis.right}
          tone="bg-pass-stamp"
          label={axis.rightLabel}
        />
      </div>
    </div>
  )
}

function Marker({
  percent,
  tone,
  label,
}: {
  percent: number
  tone: string
  label: string
}) {
  return (
    <span
      style={{ left: `${percent}%` }}
      className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${tone} ring-pass-cream ring-2`}
    >
      <span className="sr-only">
        {label} 쪽으로 {percent}
      </span>
    </span>
  )
}
