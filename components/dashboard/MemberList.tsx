import { SteeringWheelIcon } from '@phosphor-icons/react/dist/ssr'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Member } from '@/lib/data/types'

/** 카드 대신 구분선으로 묶는다. 한 줄에 한 사람이면 상자는 과하다. */
export function MemberList({ members }: { members: Member[] }) {
  return (
    <ul className="divide-line border-line bg-surface rounded-card divide-y border px-5">
      {members.map((member) => (
        <li key={member.userId} className="flex items-center gap-3 py-4">
          <Avatar name={member.displayName} size="lg" />
          <span className="font-display flex-1 font-medium">
            {member.displayName}
          </span>
          <span className="flex gap-1.5">
            {member.role === 'host' ? (
              <Badge className="bg-ink/5 text-ink">방장</Badge>
            ) : null}
            {member.isDriver ? (
              <Badge className="bg-lime text-ink">
                <SteeringWheelIcon size={13} weight="bold" aria-hidden />
                운전자
              </Badge>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
