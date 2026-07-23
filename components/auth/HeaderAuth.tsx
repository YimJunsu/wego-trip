import Link from 'next/link'
import { signOutAction } from '@/lib/auth/actions'
import { getUser } from '@/lib/auth/session'

/** 헤더 오른쪽. 서버 컴포넌트라 세션을 직접 읽는다. */
export async function HeaderAuth() {
  const user = await getUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-muted hover:text-ink block shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition duration-200"
      >
        로그인
      </Link>
    )
  }

  return (
    <form action={signOutAction} className="flex shrink-0 items-center gap-1">
      <span className="text-muted hidden px-2 text-sm font-medium sm:block">
        {user.name}
      </span>
      <button
        type="submit"
        className="text-muted hover:text-ink rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition duration-200"
      >
        로그아웃
      </button>
    </form>
  )
}
