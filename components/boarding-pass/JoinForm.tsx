'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  InviteCodeInput,
  INVITE_CODE_LENGTH,
} from '@/components/boarding-pass/InviteCodeInput'
import { PassButton } from '@/components/boarding-pass/PassButton'
import { TripPass } from '@/components/boarding-pass/TripPass'
import { joinTripByCode } from '@/lib/trips/actions'
import type { Trip } from '@/lib/data/types'

type Phase = 'idle' | 'submitting' | 'joined'

export function JoinForm() {
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string>()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPhase('submitting')
    setError(undefined)
    try {
      setTrip(await joinTripByCode(code))
      setPhase('joined')
    } catch {
      setError('그런 코드는 없습니다. 방장에게 다시 물어보세요.')
      setPhase('idle')
    }
  }

  if (phase === 'joined' && trip) {
    return (
      <div className="flex flex-col gap-5">
        <TripPass trip={trip} stampLabel="BOARDED" isStampAnimated />
        <Link
          href={`/trips/${trip.id}`}
          className="bg-pass-navy text-pass-cream rounded-pass px-5 py-3 text-center font-mono text-sm tracking-widest"
        >
          여행방 들어가기
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <InviteCodeInput value={code} onChange={setCode} error={error} />
      <PassButton
        type="submit"
        disabled={code.length < INVITE_CODE_LENGTH || phase === 'submitting'}
      >
        {phase === 'submitting' ? 'CHECKING…' : 'BOARDING'}
      </PassButton>
    </form>
  )
}
