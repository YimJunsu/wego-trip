import { test } from 'node:test'
import assert from 'node:assert/strict'
import seed from '../../mocks/compat.json' with { type: 'json' }
import { axisGap, gapVerdict, widestAxis } from './verdict.ts'

const BREAKDOWN = seed.breakdown as {
  axis: string
  label: string
  leftLabel: string
  rightLabel: string
  left: number
  right: number
}[]

test('축 간격은 두 위치의 차이다', () => {
  assert.equal(axisGap({ left: 20, right: 35 } as never), 15)
  assert.equal(axisGap({ left: 85, right: 15 } as never), 70)
  // 순서가 바뀌어도 같은 값
  assert.equal(axisGap({ left: 35, right: 20 } as never), 15)
})

test('간격이 벌어질수록 판정이 세진다', () => {
  assert.equal(gapVerdict(0), '거의 같음')
  assert.equal(gapVerdict(20), '거의 같음')
  assert.equal(gapVerdict(21), '조금 다름')
  assert.equal(gapVerdict(45), '조금 다름')
  assert.equal(gapVerdict(46), '많이 다름')
  assert.equal(gapVerdict(100), '많이 다름')
})

test('가장 갈린 축을 집어낸다', () => {
  const worst = widestAxis(BREAKDOWN as never)
  // seed에서 기상(아침형 15 vs 올빼미 85)이 제일 벌어져 있다
  assert.equal(worst?.axis, 'morning')
  assert.equal(axisGap(worst as never), 70)
})

test('축이 없으면 null', () => {
  assert.equal(widestAxis([]), null)
})

test('seed의 모든 축 위치가 0~100 안에 있다', () => {
  for (const axis of BREAKDOWN) {
    for (const pos of [axis.left, axis.right]) {
      assert.ok(
        pos >= 0 && pos <= 100,
        `${axis.axis}: ${pos}이 0~100 밖이다 (그래프가 트랙을 벗어난다)`,
      )
    }
  }
})
