import { describe, expect, it } from 'vitest'
import { convert, split, ENVELOPES } from '../domain/money'
import { initialState, reducer } from './store'

describe('reducer', () => {
  it('route moves a payment from the queue to history and adds exactly its split', () => {
    const p = initialState.queue[1]
    const next = reducer(initialState, { type: 'route', key: p.key })
    const parts = split(convert(p.cents, p.currency, 'USD'), initialState.rules)

    expect(next.queue.some((q) => q.key === p.key)).toBe(false)
    expect(next.queue).toHaveLength(initialState.queue.length - 1)
    expect(next.history[0]).toMatchObject({ key: p.key, when: 'now' })
    for (const k of ENVELOPES) expect(next.balances[k] - initialState.balances[k]).toBe(parts[k])
  })

  it('route ignores unknown keys', () => {
    expect(reducer(initialState, { type: 'route', key: 'nope' })).toBe(initialState)
  })

  it('ages the previous "now" entry', () => {
    const [a, b] = initialState.queue
    const s = reducer(reducer(initialState, { type: 'route', key: a.key }), { type: 'route', key: b.key })
    expect(s.history.slice(0, 2).map((h) => h.when)).toEqual(['now', '1m'])
  })

  it('refill gives fresh keys and starts the loop from the opening balances', () => {
    const routed = reducer(initialState, { type: 'route', key: initialState.queue[0].key })
    const s = reducer(routed, { type: 'refillQueue' })
    expect(s.queue).toHaveLength(initialState.queue.length)
    expect(s.queue.every((q) => !initialState.queue.some((o) => o.key === q.key))).toBe(true)
    expect(s.balances).toEqual(initialState.balances)
  })

  it('keeps only the latest three history rows', () => {
    const s = initialState.queue.reduce((st, q) => reducer(st, { type: 'route', key: q.key }), initialState)
    expect(s.history).toHaveLength(3)
    expect(s.history[0].key).toBe(initialState.queue.at(-1)!.key)
  })

  it('setRule keeps the sum within 100', () => {
    const s = reducer(initialState, { type: 'setRule', key: 'taxes', value: 95 })
    expect(s.rules).toEqual({ taxes: 95, savings: 5 })
  })
})
