import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authRepo } from '@/lib/data'
import type { Profile } from '@/lib/data/types'

/**
 * 쿠키 세션. Supabase Auth가 정확히 이 모양(httpOnly 쿠키)을 쓰므로,
 * 전환 시 이 파일 안쪽만 갈아끼우고 화면은 건드리지 않는다.
 *
 * mock 단계의 한계: 값이 서명 없는 userId라 브라우저에서 고치면 사칭된다.
 * Supabase 전환 시 서명된 JWT가 이 자리를 대신한다.
 */

const SESSION_COOKIE = 'wego_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export async function createSession(userId: string): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getUser(): Promise<Profile | null> {
  const store = await cookies()
  const userId = store.get(SESSION_COOKIE)?.value
  if (!userId) return null
  return authRepo.findById(userId)
}

/** 보호할 페이지 첫 줄에 둔다. 로그인하지 않았으면 여기서 멈춘다. */
export async function requireUser(): Promise<Profile> {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}
