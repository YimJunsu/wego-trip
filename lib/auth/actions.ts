'use server'

import { redirect } from 'next/navigation'
import { authRepo } from '@/lib/data'
import { DuplicateEmailError } from '@/lib/data/mock/authRepo'
import { createSession, destroySession } from './session'
import { normalizePhone, validateSignUp, type FieldErrors } from './validate'

export type AuthFormState = { errors?: FieldErrors; message?: string }

function field(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fields = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    password: field(formData, 'password'),
    phone: field(formData, 'phone'),
    birthDate: field(formData, 'birthDate'),
  }

  // 브라우저 검증은 우회 가능하므로 여기서 다시 본다.
  const errors = validateSignUp(fields, new Date())
  if (Object.keys(errors).length > 0) return { errors }

  let userId: string
  try {
    const profile = await authRepo.signUp({
      ...fields,
      phone: normalizePhone(fields.phone),
    })
    userId = profile.id
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { errors: { email: error.message } }
    }
    throw error
  }

  await createSession(userId)
  redirect('/')
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  let userId: string
  try {
    const profile = await authRepo.signIn(
      field(formData, 'email'),
      field(formData, 'password'),
    )
    userId = profile.id
  } catch {
    // 어느 쪽이 틀렸는지 구분해 알리지 않는다.
    return { message: '이메일 또는 비밀번호가 맞지 않습니다.' }
  }

  await createSession(userId)
  redirect('/')
}

export async function signOutAction(): Promise<void> {
  await destroySession()
  redirect('/')
}
