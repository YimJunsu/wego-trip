import type { DataState, QueryOptions } from '../repositories'

/**
 * mock 전용. `?state=` search param으로 화면의 빈/로딩/에러 상태를 재현한다.
 * Supabase 전환 시 이 파일과 QueryOptions는 함께 사라진다.
 */

const NORMAL_DELAY_MS = 150
const LOADING_DELAY_MS = 3000
const ERROR_DELAY_MS = 400

export class MockDataError extends Error {
  constructor() {
    super('mock: 요청한 에러 상태입니다.')
    this.name = 'MockDataError'
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** `empty`일 때 무엇을 빈 값으로 볼지는 호출부가 정한다(배열이면 [], 단건이면 null). */
export async function resolve<T>(
  opts: QueryOptions | undefined,
  data: T,
  emptyValue: T,
): Promise<T> {
  switch (opts?.state) {
    case 'error':
      await delay(ERROR_DELAY_MS)
      throw new MockDataError()
    case 'loading':
      await delay(LOADING_DELAY_MS)
      return data
    case 'empty':
      await delay(NORMAL_DELAY_MS)
      return emptyValue
    default:
      await delay(NORMAL_DELAY_MS)
      return data
  }
}

const DATA_STATES: readonly DataState[] = ['empty', 'loading', 'error']

export function parseDataState(value: unknown): DataState | undefined {
  return DATA_STATES.find((state) => state === value)
}
