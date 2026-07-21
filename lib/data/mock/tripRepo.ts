import seed from '@/mocks/trips.json'
import memberSeed from '@/mocks/members.json'
import { InvalidInviteCodeError, type TripRepository } from '../repositories'
import type { Member, Trip } from '../types'
import { resolve } from './state'

const trips = [...(seed as Trip[])]
const members = [...(memberSeed as Member[])]

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const INVITE_CODE_LENGTH = 6

/** 헷갈리는 글자(0/O, 1/I)를 뺀 6자리. 입 밖으로 불러줄 수 있어야 한다. */
function generateInviteCode(): string {
  return Array.from(
    { length: INVITE_CODE_LENGTH },
    () =>
      INVITE_CODE_ALPHABET[
        Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)
      ],
  ).join('')
}

export const mockTripRepo: TripRepository = {
  async list(userId, opts) {
    const mine = members.filter((m) => m.userId === userId).map((m) => m.tripId)
    const found = trips.filter((t) => mine.includes(t.id))
    return resolve(opts, found, [])
  },

  async get(id, opts) {
    const found = trips.find((t) => t.id === id) ?? null
    return resolve(opts, found, null)
  },

  async create(userId, displayName, input) {
    const trip: Trip = {
      ...input,
      id: `trp-${Date.now()}`,
      inviteCode: generateInviteCode(),
      createdBy: userId,
    }
    trips.push(trip)
    members.push({
      tripId: trip.id,
      userId,
      displayName,
      role: 'host',
      isDriver: false,
    })
    return trip
  },

  async joinByCode(userId, displayName, code) {
    const trip = trips.find(
      (t) => t.inviteCode.toUpperCase() === code.trim().toUpperCase(),
    )
    if (!trip) throw new InvalidInviteCodeError()

    // 이미 들어와 있으면 다시 넣지 않는다. 두 번 눌러도 멤버가 겹치지 않는다.
    const already = members.some(
      (m) => m.tripId === trip.id && m.userId === userId,
    )
    if (!already) {
      members.push({
        tripId: trip.id,
        userId,
        displayName,
        role: 'member',
        isDriver: false,
      })
    }
    return trip
  },

  async listMembers(tripId, opts) {
    const found = members.filter((m) => m.tripId === tripId)
    return resolve(opts, found, [])
  },
}
