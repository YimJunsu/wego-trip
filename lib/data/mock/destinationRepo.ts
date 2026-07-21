import seed from '@/mocks/destinations.json'
import type { DestinationRepository } from '../repositories'
import type { Destination, DestinationFilter } from '../types'
import { resolve } from './state'

const destinations = seed as Destination[]

function match(dst: Destination, filter?: DestinationFilter): boolean {
  if (!filter) return true
  if (filter.region && dst.region !== filter.region) return false
  /** 테마는 OR. 하나라도 걸리면 후보다 — 여러 개 고를수록 후보가 늘어야 자연스럽다. */
  if (
    filter.themes?.length &&
    !filter.themes.some((t) => dst.themes.includes(t))
  ) {
    return false
  }
  if (filter.budget && dst.budget !== filter.budget) return false
  if (filter.season && !dst.seasons.includes(filter.season)) return false
  return true
}

export const mockDestinationRepo: DestinationRepository = {
  async list(filter, opts) {
    const found = destinations.filter((d) => match(d, filter))
    return resolve(opts, found, [])
  },

  async draw(filter, opts) {
    const pool = destinations.filter((d) => match(d, filter))
    const picked = pool.length
      ? pool[Math.floor(Math.random() * pool.length)]
      : null
    return resolve(opts, picked, null)
  },
}
