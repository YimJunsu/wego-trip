'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/session'
import { InvalidInviteCodeError, tripRepo } from '@/lib/data'
import type { DestinationTheme, Trip } from '@/lib/data/types'

export type TripFormState = {
  errors?: Record<string, string>
  message?: string
}

export type JoinFormState = { message?: string; trip?: Trip }

function field(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function createTripAction(
  _prev: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const user = await requireUser()

  const name = field(formData, 'name').trim()
  const region = field(formData, 'region').trim()
  const startDate = field(formData, 'startDate')
  const endDate = field(formData, 'endDate')
  const coverTheme = field(formData, 'coverTheme') as DestinationTheme

  const errors: Record<string, string> = {}
  if (!name) errors.name = '이름은 있어야 합니다.'
  if (!region) errors.region = '어디로 가는지는 정해야 합니다.'
  if (!startDate) errors.startDate = '출발일을 고르세요.'
  if (!endDate) errors.endDate = '돌아오는 날을 고르세요.'
  if (startDate && endDate && endDate < startDate) {
    errors.endDate = '돌아오는 날이 출발일보다 빠릅니다.'
  }
  if (Object.keys(errors).length > 0) return { errors }

  const trip = await tripRepo.create(user.id, user.name, {
    name,
    region,
    startDate,
    endDate,
    coverTheme,
  })
  redirect(`/trips/${trip.id}`)
}

/**
 * 참여는 redirect하지 않고 Trip을 돌려준다.
 * 폼이 보딩패스에 BOARDED 도장을 찍어 보여주는 연출을 유지하기 위해서다.
 * 인증은 여기 requireUser()가 이미 걸었으므로 그대로다.
 */
export async function joinTripAction(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const user = await requireUser()

  try {
    const trip = await tripRepo.joinByCode(
      user.id,
      user.name,
      field(formData, 'code'),
    )
    return { trip }
  } catch (error) {
    if (error instanceof InvalidInviteCodeError) {
      return { message: '그런 코드는 없습니다. 방장에게 다시 물어보세요.' }
    }
    throw error
  }
}
