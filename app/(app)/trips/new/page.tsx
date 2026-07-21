import { NewTripForm } from '@/components/dashboard/NewTripForm'
import { requireUser } from '@/lib/auth/session'

export default async function NewTripPage() {
  await requireUser()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          여행방 만들기
        </h1>
        <p className="text-muted mt-1 text-sm">
          날짜는 나중에 바꿔도 됩니다. 일단 만들고 친구부터 부르세요.
        </p>
      </header>

      <NewTripForm />
    </div>
  )
}
