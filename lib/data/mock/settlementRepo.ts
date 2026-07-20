import seed from '@/mocks/settlements.json'
import type { SettlementRepository } from '../repositories'
import type { Settlement } from '../types'
import { resolve } from './state'

const { _comment, ...byTrip } = seed
void _comment

const settlements = byTrip as Record<string, Settlement[]>

export const mockSettlementRepo: SettlementRepository = {
  async listByTrip(tripId, opts) {
    const found = settlements[tripId] ?? []
    return resolve(opts, found, [])
  },
}
