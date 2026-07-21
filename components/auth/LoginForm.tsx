'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { TextField } from '@/components/dashboard/TextField'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { signInAction, type AuthFormState } from '@/lib/auth/actions'

const EMPTY: AuthFormState = {}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, EMPTY)

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-5">
        <TextField label="이메일" name="email" type="email" required />
        <TextField label="비밀번호" name="password" type="password" required />
        {state.message ? (
          <p role="alert" className="text-danger text-sm">
            {state.message}
          </p>
        ) : null}
        <ActionButton type="submit" tone="ink" size="lg" disabled={isPending}>
          {isPending ? '확인 중…' : '로그인'}
        </ActionButton>
      </form>

      <div className="flex items-center gap-3">
        <span className="bg-line h-px flex-1" />
        <span className="text-muted font-mono text-xs tracking-widest">또는</span>
        <span className="bg-line h-px flex-1" />
      </div>

      <SocialButtons />

      <p className="text-muted text-center text-sm">
        아직 회원이 아니라면{' '}
        <Link href="/signup" className="text-ink font-medium underline">
          가입하기
        </Link>
      </p>
    </div>
  )
}
