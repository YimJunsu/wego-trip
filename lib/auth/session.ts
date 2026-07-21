import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { authRepo, tripRepo } from '@/lib/data'
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

/** requireMember/requireMemberPage가 공유하는 멤버십 조회. 실패 시 반응은 호출부가 정한다. */
async function checkMembership(
  tripId: string,
): Promise<{ user: Profile; isMember: boolean }> {
  const user = await requireUser()
  const members = await tripRepo.listMembers(tripId)
  return { user, isMember: members.some((m) => m.userId === user.id) }
}

/**
 * Server Action은 페이지 게이트를 거치지 않고 id로 바로 호출될 수 있다(네트워크 레벨).
 * 로그인만으로는 부족하다 — tripId에 속한 멤버인지까지 여기서 다시 확인해야
 * 다른 사람의 여행방에 데이터를 쓰는 걸 막는다. 여행방 데이터를 바꾸는 모든 액션의
 * 첫 줄에 둔다.
 */
export async function requireMember(tripId: string): Promise<Profile> {
  const { user, isMember } = await checkMembership(tripId)
  if (!isMember) throw new Error('이 여행방의 멤버가 아닙니다.')
  return user
}

/**
 * 여행방 읽기 페이지(상세/정산/장소) 첫 줄에 둔다. 멤버가 아니라는 사실을 그대로 던지면
 * "여행방이 없다"와 "내 것이 아니다"를 구분할 수 있게 돼, 초대코드를 몰라도 남의 방이
 * 존재한다는 것 자체를 알아낼 수 있다 — 그래서 404로 감춰 구분이 안 되게 한다.
 */
export async function requireMemberPage(tripId: string): Promise<Profile> {
  const { user, isMember } = await checkMembership(tripId)
  if (!isMember) notFound()
  return user
}
