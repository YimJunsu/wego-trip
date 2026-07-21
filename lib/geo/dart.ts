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

/**
 * 무작위는 두 겹이다. 바람은 던지기 전에 보여주고(보정 가능), 산포는 숨긴다.
 * 바람만 있으면 결국 계산이 되고, 산포만 있으면 왜 빗나갔는지 몰라 억울하다.
 * 바람이 납득을, 산포가 진짜 불확실성을 담당한다.
 */

/** 풀파워 손떨림 반경. 시군구 평균 크기가 약 58px이라 이 값이면 옆 동네로 샌다. */
export const MAX_SCATTER = 90
/** 풀파워·최대세기 바람이 밀어내는 거리. */
export const MAX_WIND_DRIFT = 110
/** 조준선 길이. 착지점이 아니라 방향만 알려주는 고정 길이다. */
export const AIM_LINE_LENGTH = 150

export type Wind = { angle: number; strength: number }

const TAU = Math.PI * 2

/** 매 라운드 굴린다. 세기 0.3~1.0 — 0이면 바람이 있다는 걸 못 느낀다. */
export function rollWind(rand: () => number = Math.random): Wind {
  return { angle: rand() * TAU, strength: 0.3 + rand() * 0.7 }
}

/**
 * 파워에 비례하는 원판 균등 분포.
 * 반경에 √u를 쓰지 않으면 중심에 몰린다(넓이가 r²에 비례하므로).
 */
export function scatterOffset(
  power: number,
  rand: () => number = Math.random,
): Vec {
  const r = MAX_SCATTER * power * Math.sqrt(rand())
  const theta = rand() * TAU
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}

/** 바람이 밀어내는 편류. 멀리 갈수록 오래 실려 있으므로 파워에 비례한다. */
export function windDrift(wind: Wind, power: number): Vec {
  const d = MAX_WIND_DRIFT * wind.strength * power
  return { x: Math.cos(wind.angle) * d, y: Math.sin(wind.angle) * d }
}

/** 조준점 + 산포 + 바람. 최종 착지점. */
export function resolveLanding(
  home: Vec,
  pull: Vec,
  wind: Wind,
  rand: () => number = Math.random,
): Vec {
  const aim = landingPoint(home, pull)
  const power = throwPower(pull)
  const s = scatterOffset(power, rand)
  const w = windDrift(wind, power)
  return { x: aim.x + s.x + w.x, y: aim.y + s.y + w.y }
}

/** 조준 방향으로 뻗는 짧은 선의 끝점. 어디로 갈지가 아니라 어느 쪽인지만 준다. */
export function aimDirectionPoint(home: Vec, pull: Vec): Vec {
  const len = Math.hypot(pull.x, pull.y)
  if (len === 0) return home
  return {
    x: home.x - (pull.x / len) * AIM_LINE_LENGTH,
    y: home.y - (pull.y / len) * AIM_LINE_LENGTH,
  }
}

/**
 * 비행 중 궤적을 바람 쪽으로 부풀리는 양. 시작·끝은 0이라 착지점은 안 흔들린다.
 * `k - k²`은 k=0.5에서 최대 0.25 — 4를 곱해 중간 최대 편차가 bow와 같아진다.
 */
export function windBow(wind: Wind, k: number): Vec {
  const m = MAX_WIND_DRIFT * wind.strength * (k - k * k) * 4
  return { x: Math.cos(wind.angle) * m, y: Math.sin(wind.angle) * m }
}

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
