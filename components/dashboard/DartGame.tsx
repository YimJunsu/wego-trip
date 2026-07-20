'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { EyeSlashIcon } from '@phosphor-icons/react'
import { DartMissCard, DartResultCard } from '@/components/dashboard/DartResultCard'
import { FilterChip } from '@/components/dashboard/FilterChip'
import { KoreaMapLayer } from '@/components/dashboard/KoreaMapLayer'
import {
  clampPull,
  easeOutCubic,
  FLIGHT_MS,
  flightAngle,
  landingPoint,
  MIN_POWER,
  throwPower,
  type Vec,
} from '@/lib/geo/dart'
import { koreaMap, unprojectPoint, type SigunguRegion } from '@/lib/geo/koreaMap'

type Mode = 'aim' | 'blind'
type Phase = 'ready' | 'aiming' | 'flying' | 'hit' | 'miss'
type Outcome = {
  region: SigunguRegion | null
  coords: [number, number] | null
  landing: Vec
}

const { width: W, height: H, dock: DOCK } = koreaMap
/** 다트가 대기하는 곳. 지도 아래 바다 한가운데. */
const HOME: Vec = { x: W / 2, y: H - DOCK / 2 }
const GRAB_RADIUS = 120
const RING_R = 64

export function DartGame() {
  const [mode, setMode] = useState<Mode>('aim')
  const [phase, setPhase] = useState<Phase>('ready')
  const [pull, setPull] = useState<Vec>({ x: 0, y: 0 })
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const dartRef = useRef<SVGGElement>(null)
  const grabRef = useRef<Vec>({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const revealRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hitRef = useRef<{
    ctx: CanvasRenderingContext2D
    entries: { region: SigunguRegion; path: Path2D }[]
  }>(null)

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(revealRef.current)
    },
    [],
  )

  function reset(nextMode?: Mode) {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(revealRef.current)
    if (nextMode) setMode(nextMode)
    setPhase('ready')
    setPull({ x: 0, y: 0 })
    setOutcome(null)
    setIsRevealed(false)
  }

  function toSvg(e: React.PointerEvent): Vec {
    const rect = svgRef.current!.getBoundingClientRect()
    const scale = W / rect.width
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
  }

  function hitTest(point: Vec): SigunguRegion | null {
    if (!hitRef.current) {
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return null
      hitRef.current = {
        ctx,
        entries: koreaMap.regions.map((region) => ({
          region,
          path: new Path2D(region.path),
        })),
      }
    }
    const { ctx, entries } = hitRef.current
    for (const { region, path } of entries) {
      if (ctx.isPointInPath(path, point.x, point.y)) return region
    }
    return null
  }

  function land(target: Vec, chosen: SigunguRegion | null) {
    const region = chosen ?? hitTest(target)
    if (!region) {
      setOutcome({ region: null, coords: null, landing: target })
      setPhase('miss')
      return
    }
    // 울릉군은 인셋 박스에 그려 svg 좌표가 실좌표와 어긋난다. 이때만 지리 중심으로 표기.
    const coords =
      chosen || region.name === '울릉군'
        ? region.centroid
        : unprojectPoint(target.x, target.y)
    setOutcome({ region, coords, landing: target })
    setPhase('hit')
    if (chosen) revealRef.current = setTimeout(() => setIsRevealed(true), 450)
  }

  function fly(target: Vec, chosen: SigunguRegion | null) {
    setPhase('flying')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      land(target, chosen)
      return
    }
    const angle = flightAngle(HOME, target)
    const start = performance.now()
    const frame = (now: number) => {
      const t = Math.min((now - start) / FLIGHT_MS, 1)
      const k = easeOutCubic(t)
      const x = HOME.x + (target.x - HOME.x) * k
      const y = HOME.y + (target.y - HOME.y) * k
      const s = 1 + 0.55 * Math.sin(Math.PI * t) // 붕 떠올랐다 내려꽂히는 느낌
      dartRef.current?.setAttribute(
        'transform',
        `translate(${x} ${y}) rotate(${angle}) scale(${s})`,
      )
      if (t < 1) rafRef.current = requestAnimationFrame(frame)
      else land(target, chosen)
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (phase === 'flying') return
    const p = toSvg(e)
    if (Math.hypot(p.x - HOME.x, p.y - HOME.y) > GRAB_RADIUS) return
    grabRef.current = p
    setOutcome(null)
    setIsRevealed(false)
    setPull({ x: 0, y: 0 })
    setPhase('aiming')
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 일부 브라우저는 이미 끝난 포인터에 대해 던진다. 캡처 없이도 동작한다.
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (phase !== 'aiming') return
    const p = toSvg(e)
    setPull(
      clampPull({ x: p.x - grabRef.current.x, y: p.y - grabRef.current.y }),
    )
  }

  function onPointerUp(e: React.PointerEvent) {
    if (phase !== 'aiming') return
    // state의 pull은 마지막 move보다 늦을 수 있다. 놓은 지점 기준으로 다시 계산.
    const p = toSvg(e)
    const finalPull = clampPull({
      x: p.x - grabRef.current.x,
      y: p.y - grabRef.current.y,
    })
    const power = throwPower(finalPull)
    if (power < MIN_POWER) {
      setPhase('ready')
      return
    }
    let chosen: SigunguRegion | null = null
    let target: Vec
    if (mode === 'blind') {
      // 눈 가리고: 어차피 안 보이니 착지는 무작위 지역의 대표점으로 스냅한다.
      chosen =
        koreaMap.regions[Math.floor(Math.random() * koreaMap.regions.length)]
      target = { x: chosen.anchor[0], y: chosen.anchor[1] }
    } else {
      const raw = landingPoint(HOME, finalPull)
      target = {
        x: Math.min(Math.max(raw.x, 12), W - 12),
        y: Math.min(Math.max(raw.y, 12), H - 60),
      }
    }
    setPull({ x: 0, y: 0 })
    fly(target, chosen)
  }

  const power = throwPower(pull)
  const isAiming = phase === 'aiming'
  const target = useMemo(() => landingPoint(HOME, pull), [pull])
  const dartPos: Vec =
    phase === 'hit' || phase === 'miss'
      ? (outcome?.landing ?? HOME)
      : isAiming
        ? { x: HOME.x + pull.x, y: HOME.y + pull.y }
        : HOME
  const dartAngle =
    isAiming && power >= MIN_POWER ? flightAngle(dartPos, target) : 0
  const showResult = phase === 'hit' && (mode === 'aim' || isRevealed)
  const ringC = 2 * Math.PI * RING_R

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <FilterChip
            label="조준"
            isSelected={mode === 'aim'}
            onToggle={() => reset('aim')}
          />
          <FilterChip
            label="눈 가리고"
            isSelected={mode === 'blind'}
            onToggle={() => reset('blind')}
          />
        </div>
        <p className="text-muted font-mono text-xs tracking-widest">
          시·군·구 {koreaMap.regions.length}곳
        </p>
      </div>

      <div className="bg-surface rounded-card border-line shadow-soft relative mx-auto w-full max-w-md overflow-hidden border">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full touch-none select-none"
          role="application"
          aria-label="대한민국 지도에 다트 던지기"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => phase === 'aiming' && setPhase('ready')}
        >
          <KoreaMapLayer highlightCode={showResult ? outcome?.region?.code : null} />

          {/* 파워 링: 당길수록 라임 게이지가 찬다 */}
          {isAiming && (
            <g>
              <circle
                cx={HOME.x}
                cy={HOME.y}
                r={RING_R}
                strokeWidth={7}
                className="stroke-ink/10 fill-none"
              />
              <circle
                cx={HOME.x}
                cy={HOME.y}
                r={RING_R}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={`${power * ringC} ${ringC}`}
                transform={`rotate(-90 ${HOME.x} ${HOME.y})`}
                className="stroke-lime fill-none"
              />
            </g>
          )}

          {/* 조준선: 눈 가리고 모드에서는 보여주지 않는다 */}
          {isAiming && mode === 'aim' && power >= MIN_POWER && (
            <line
              x1={HOME.x}
              y1={HOME.y}
              x2={target.x}
              y2={target.y}
              strokeWidth={3}
              strokeDasharray="10 12"
              strokeLinecap="round"
              className="stroke-ink/30"
            />
          )}

          {/* 착지 핀 */}
          {showResult && outcome && (
            <g
              transform={`translate(${outcome.landing.x} ${outcome.landing.y})`}
              className="animate-stamp"
            >
              <circle r={22} className="fill-lime/40" />
              <circle r={9} className="fill-ink" />
            </g>
          )}

          {/* 다트. 비행 중엔 rAF가 transform을 직접 만진다 */}
          {phase !== 'hit' && phase !== 'miss' && (
            <g
              ref={dartRef}
              transform={`translate(${dartPos.x} ${dartPos.y}) rotate(${dartAngle})`}
              className="pointer-events-none"
            >
              <path d="M0 -36 L8 -8 L-8 -8 Z" className="fill-ink" />
              <rect x={-3.5} y={-10} width={7} height={28} rx={3.5} className="fill-ink" />
              <path d="M0 10 L12 30 L0 23 L-12 30 Z" className="fill-lime" />
            </g>
          )}
        </svg>

        {/* 눈 가리고: 지도만 가리고 다트 독은 남긴다 */}
        {mode === 'blind' && (
          <div
            aria-hidden={isRevealed}
            style={{ height: `${((H - DOCK) / H) * 100}%` }}
            className={`bg-ink absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-500 ${
              isRevealed ? 'pointer-events-none opacity-0' : 'opacity-95'
            }`}
          >
            <EyeSlashIcon size={28} className="text-paper/80" aria-hidden />
            <p className="text-paper/70 font-mono text-xs tracking-widest">
              어딘지 모르고 던지는 중
            </p>
          </div>
        )}

        {phase === 'ready' && (
          <p className="text-muted pointer-events-none absolute inset-x-0 bottom-2 text-center font-mono text-xs tracking-widest">
            다트를 잡고 당겼다 놓기
          </p>
        )}
      </div>

      {showResult && outcome?.region && outcome.coords && (
        <DartResultCard
          region={outcome.region}
          coords={outcome.coords}
          onRetry={() => reset()}
        />
      )}
      {phase === 'miss' && <DartMissCard onRetry={() => reset()} />}
    </div>
  )
}
