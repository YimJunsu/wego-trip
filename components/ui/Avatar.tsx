import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

const SIZE = {
  sm: 28,
  md: 36,
  lg: 48,
} as const

export type AvatarSize = keyof typeof SIZE

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string
  src?: string
  size?: AvatarSize
  className?: string
}) {
  const px = SIZE[size]

  return (
    <span
      style={{ width: px, height: px }}
      className={cn(
        'border-surface bg-lime-soft relative inline-block shrink-0 overflow-hidden rounded-full border-2',
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-display flex h-full w-full items-center justify-center text-xs font-semibold">
          {name.slice(0, 1)}
        </span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  )
}

/** 겹쳐 놓은 멤버 목록. 참고 이미지의 그룹 아바타처럼 왼쪽으로 조금씩 물린다. */
export function AvatarStack({
  people,
  size = 'sm',
  label,
}: {
  people: { id: string; nickname: string; avatarUrl?: string }[]
  size?: AvatarSize
  label: string
}) {
  return (
    <ul className="flex items-center -space-x-2" aria-label={label}>
      {people.map((person) => (
        <li key={person.id}>
          <Avatar name={person.nickname} src={person.avatarUrl} size={size} />
        </li>
      ))}
    </ul>
  )
}
