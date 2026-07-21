import { JoinForm } from '@/components/boarding-pass/JoinForm'
import { tripRepo } from '@/lib/data'
import { requireUser } from '@/lib/auth/session'

export default async function JoinPage() {
  await requireUser()

  /** mock에서만 보여 주는 힌트. 실제 코드는 친구가 불러 준다. */
  const trips = await tripRepo.list()

  return (
    <div className="flex flex-col gap-6">
      <header className="text-pass-navy">
        <p className="font-mono text-xs tracking-widest opacity-70">
          BOARDING PASS
        </p>
        <h1 className="mt-1 font-mono text-2xl tracking-widest">
          초대코드로 참여
        </h1>
        <p className="mt-2 text-sm opacity-80">
          친구가 알려준 6자리를 넣으면 여행권이 나옵니다.
        </p>
      </header>

      <JoinForm />

      <p className="border-pass-line text-pass-navy/70 rounded-pass border border-dashed p-3 font-mono text-xs tracking-widest">
        MOCK · 써 볼 코드: {trips.map((t) => t.inviteCode).join(' / ')}
      </p>
    </div>
  )
}
