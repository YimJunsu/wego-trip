'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { TextField } from '@/components/dashboard/TextField'
import { signUpAction, type AuthFormState } from '@/lib/auth/actions'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/validate'

const EMPTY: AuthFormState = {}

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, EMPTY)
  const errors = state.errors ?? {}

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} noValidate className="flex flex-col gap-5">
        <TextField label="이름" name="name" required error={errors.name} />
        <TextField
          label="이메일"
          name="email"
          type="email"
          required
          error={errors.email}
        />
        <TextField
          label="비밀번호"
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          hint={`${MIN_PASSWORD_LENGTH}자 이상`}
          error={errors.password}
        />
        <TextField
          label="전화번호"
          name="phone"
          type="tel"
          required
          hint="010-1234-5678"
          error={errors.phone}
        />
        <TextField
          label="생년월일"
          name="birthDate"
          type="date"
          required
          error={errors.birthDate}
        />
        <ActionButton type="submit" tone="ink" size="lg" disabled={isPending}>
          {isPending ? '가입 중…' : '가입하고 시작하기'}
        </ActionButton>
      </form>

      <p className="text-muted text-center text-sm">
        이미 회원이라면{' '}
        <Link href="/login" className="text-ink font-medium underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
