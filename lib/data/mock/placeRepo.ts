import seed from '@/mocks/places.json'
import type { PlaceRepository } from '../repositories'
import type { Place } from '../types'
import { resolve } from './state'

const places = [...(seed as Place[])]

export const mockPlaceRepo: PlaceRepository = {
  /** 여행방 주변 목록. 실서버에선 Kakao Local API가 좌표 기준으로 채운다. */
  async listByTrip(_tripId, opts) {
    return resolve(opts, places, [])
  },

  async toggleSave(placeId, tripId) {
    const place = places.find((p) => p.id === placeId)
    if (!place) throw new Error('그런 장소는 없습니다.')
    place.savedToTripId = place.savedToTripId === tripId ? undefined : tripId
    return place
  },
}
