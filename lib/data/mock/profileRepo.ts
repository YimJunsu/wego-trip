import memberSeed from '@/mocks/members.json'
import type { ProfileRepository } from '../repositories'
import type { Member, Profile } from '../types'
import { findProfile } from './authRepo'
import { resolve } from './state'

/**
 * ponytail: 세션이 붙기 전까지만 사는 임시 파일. Task 4에서 통째로 사라진다.
 * seed는 authRepo가 들고 있고 여기서는 조회만 한다.
 */

/** 로그인이 없으므로 첫 번째 프로필을 "나"로 고정한다. */
export const CURRENT_USER_ID = 'usr-1'

const members = memberSeed as Member[]

export const mockProfileRepo: ProfileRepository = {
  async me(opts) {
    const me = findProfile(CURRENT_USER_ID)
    if (!me) throw new Error('mock: 현재 사용자 seed가 없습니다.')
    return resolve(opts, me, me)
  },

  async listByTrip(tripId, opts) {
    const ids = members.filter((m) => m.tripId === tripId).map((m) => m.userId)
    const found = ids
      .map(findProfile)
      .filter((p): p is Profile => p !== undefined)
    return resolve(opts, found, [])
  },
}
