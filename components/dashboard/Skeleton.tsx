import { cn } from '@/lib/utils/cn'

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn('bg-ink/8 animate-pulse rounded-full', className)} />
  )
}

/** 실제 카드와 같은 크기로 자리를 잡아 둔다. 도넛 스피너는 쓰지 않는다. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">불러오는 중</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 70}ms` }}
          className="rounded-card border-line bg-surface animate-rise border p-6"
        >
          <SkeletonBlock className="h-6 w-2/5" />
          <SkeletonBlock className="mt-3 h-4 w-1/4" />
          <SkeletonBlock className="mt-6 h-4 w-3/5" />
          <div className="border-line mt-5 flex gap-2 border-t pt-4">
            <SkeletonBlock className="h-7 w-7" />
            <SkeletonBlock className="h-7 w-7" />
            <SkeletonBlock className="h-7 w-7" />
          </div>
        </div>
      ))}
    </div>
  )
}
