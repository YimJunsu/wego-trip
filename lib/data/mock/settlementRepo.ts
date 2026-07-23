import seed from '@/mocks/settlements.json'
import type { SettlementRepository } from '../repositories'
import type { Settlement } from '../types'

const { _comment, ...byTrip } = seed
void _comment

const settlements = byTrip as Record<string, Settlement[]>

export const mockSettlementRepo: SettlementRepository = {
  async listByTrip(tripId) {
    return settlements[tripId] ?? []
  },
}
