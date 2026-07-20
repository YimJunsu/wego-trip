/**
 * 다트 던지기 순수 계산. React·DOM 의존 없음.
 * 좌표는 전부 지도 svg 좌표계(px) 기준이다.
 */

export type Vec = { x: number; y: number }

/** 이만큼 당기면 풀파워. (svg px) */
export const MAX_PULL = 240
/** 풀파워 비거리. 하단 독에서 지도 꼭대기까지 닿고 조금 남는 길이. */
export const FLIGHT_RANGE = 1360
/** 이보다 약하게 당기면 던지지 않고 제자리로 돌려놓는다. */
export const MIN_POWER = 0.12
/** 손맛용 비행 시간 */
export const FLIGHT_MS = 680

export function clampPull(pull: Vec): Vec {
  const len = Math.hypot(pull.x, pull.y)
  if (len <= MAX_PULL) return pull
  return { x: (pull.x / len) * MAX_PULL, y: (pull.y / len) * MAX_PULL }
}

export function throwPower(pull: Vec): number {
  return Math.min(Math.hypot(pull.x, pull.y) / MAX_PULL, 1)
}

/** 당긴 반대 방향으로 날아간다. 새총과 같다. */
export function landingPoint(home: Vec, pull: Vec): Vec {
  const len = Math.hypot(pull.x, pull.y)
  if (len === 0) return home
  const power = throwPower(pull)
  return {
    x: home.x - (pull.x / len) * power * FLIGHT_RANGE,
    y: home.y - (pull.y / len) * power * FLIGHT_RANGE,
  }
}

/** 다트가 날아가는 방향(도). 위쪽(-y)이 0도가 되도록 보정한다. */
export function flightAngle(from: Vec, to: Vec): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 90
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
