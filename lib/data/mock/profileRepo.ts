import seed from '@/mocks/profiles.json'
import memberSeed from '@/mocks/members.json'
import type { ProfileRepository } from '../repositories'
import type { Member, Profile } from '../types'
import { resolve } from './state'

const profiles = seed as Profile[]
const members = memberSeed as Member[]

/** 로그인이 없으므로 첫 번째 프로필을 "나"로 고정한다. */
export const CURRENT_USER_ID = 'usr-1'

export const mockProfileRepo: ProfileRepository = {
  async me(opts) {
    const me = profiles.find((p) => p.id === CURRENT_USER_ID)
    if (!me) throw new Error('mock: 현재 사용자 seed가 없습니다.')
    return resolve(opts, me, me)
  },

  async listByTrip(tripId, opts) {
    const ids = members.filter((m) => m.tripId === tripId).map((m) => m.userId)
    const found = profiles.filter((p) => ids.includes(p.id))
    return resolve(opts, found, [])
  },
}

export function findProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id)
}
