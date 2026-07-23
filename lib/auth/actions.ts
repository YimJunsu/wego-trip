'use server'

import { redirect } from 'next/navigation'
import {
  authRepo,
  DuplicateEmailError,
  InvalidCredentialsError,
} from '@/lib/data'
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
    passwordConfirm: field(formData, 'passwordConfirm'),
    phone: field(formData, 'phone'),
    birthDate: field(formData, 'birthDate'),
  }

  // 브라우저 검증은 우회 가능하므로 여기서 다시 본다.
  const errors = validateSignUp(fields, new Date())
  if (Object.keys(errors).length > 0) return { errors }

  let userId: string
  try {
    // passwordConfirm은 화면 전용 — 저장소로 넘기지 않는다.
    const { passwordConfirm: _confirm, ...input } = fields
    const profile = await authRepo.signUp({
      ...input,
      phone: normalizePhone(input.phone),
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
  } catch (error) {
    // 어느 쪽이 틀렸는지 구분해 알리지 않는다.
    if (error instanceof InvalidCredentialsError) return { message: error.message }
    throw error
  }

  await createSession(userId)
  redirect('/')
}

export async function signOutAction(): Promise<void> {
  await destroySession()
  redirect('/')
}
