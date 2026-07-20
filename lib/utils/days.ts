const DAY_MS = 86_400_000

/**
 * 여행 날짜에서 Day 목록을 파생한다. 일정 데이터 모델이 아직 없어서 날짜만으로 만든다.
 * 날짜를 UTC로 파싱하는 건 의도적이다 — toISOString()이 UTC로 되돌리므로,
 * 로컬 타임존으로 파싱하면 하루가 밀린다.
 */
export function listTripDays(startIso: string, endIso: string): string[] {
  const start = Date.parse(`${startIso}T00:00:00Z`)
  const end = Date.parse(`${endIso}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return []

  const days: string[] = []
  for (let t = start; t <= end; t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10))
  }
  return days
}
