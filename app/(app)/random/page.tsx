import { DartGame } from '@/components/dashboard/DartGame'
import { RandomDrawer } from '@/components/dashboard/RandomDrawer'
import { RandomModeTabs } from '@/components/dashboard/RandomModeTabs'
import { destinationRepo, parseDataState } from '@/lib/data'
import { rollWind } from '@/lib/geo/dart'
import type { PageProps } from '@/lib/types/page'

export default async function RandomPage({ searchParams }: PageProps) {
  const { state } = await searchParams
  const dataState = parseDataState(state)
  const candidates = await destinationRepo.list(undefined, { state: dataState })

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          여행지 뽑기
        </h1>
        <p className="text-muted mt-1 text-sm">
          다트를 던지거나, 조건 걸고 운에 맡기세요. 국내 한정입니다.
        </p>
      </header>

      <RandomModeTabs
        dartPanel={<DartGame initialWind={rollWind()} />}
        slotPanel={
          <RandomDrawer initialCandidates={candidates} state={dataState} />
        }
      />
    </div>
  )
}
