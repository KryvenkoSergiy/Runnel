import { describe, expect, it } from 'vitest'
import { convert, format, formatHome, shares, simulateMonth, split, sumParts, withRule, ENVELOPES } from './money'
import { MONTH_PAYMENTS } from '../content'

describe('split', () => {
  const totals = [0, 1, 7, 99, 240000, 3800001]
  const rules = [
    { taxes: 0, savings: 0 },
    { taxes: 100, savings: 0 },
    { taxes: 0, savings: 100 },
    { taxes: 33.33, savings: 33.33 },
    { taxes: 25, savings: 15 },
    { taxes: 50, savings: 50 },
  ]

  it('always sums back to the input', () => {
    for (const t of totals) for (const r of rules) expect(sumParts(split(t, r))).toBe(t)
  })

  it('keeps every part a non-negative integer', () => {
    for (const t of totals) for (const r of rules) {
      const p = split(t, r)
      for (const k of ENVELOPES) {
        expect(Number.isInteger(p[k])).toBe(true)
        expect(p[k]).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('gives the rounding remainder to spendable', () => {
    expect(split(100, { taxes: 33.33, savings: 33.33 })).toEqual({ taxes: 33, savings: 33, spendable: 34 })
    expect(split(1, { taxes: 50, savings: 50 })).toEqual({ taxes: 0, savings: 0, spendable: 1 })
  })
})

describe('convert', () => {
  it('uses demo rates and rounds to whole cents', () => {
    expect(convert(185000, 'EUR', 'USD')).toBe(201650)
    expect(convert(3800000, 'UAH', 'USD')).toBe(91200)
    expect(convert(100, 'USD', 'GBP')).toBe(79)
    expect(convert(12345, 'GBP', 'GBP')).toBe(12345)
  })
})

describe('format', () => {
  it('uses narrow symbols and requested digits', () => {
    expect(format(240000, 'USD')).toBe('$2,400.00')
    expect(format(185000, 'EUR', 0)).toBe('€1,850')
    expect(format(3800000, 'UAH')).toBe('₴38,000.00')
  })

  it('shows USD balances in the home currency', () => {
    expect(formatHome(109000, 'EUR', 0)).toBe('€1,000')
  })
})

describe('rules', () => {
  it('gives spendable whatever is left', () => {
    expect(shares({ taxes: 25, savings: 15 })).toEqual({ taxes: 25, savings: 15, spendable: 60 })
  })

  it('takes the excess from the other rule', () => {
    expect(withRule({ taxes: 25, savings: 60 }, 'taxes', 55)).toEqual({ taxes: 55, savings: 45 })
    expect(withRule({ taxes: 25, savings: 15 }, 'savings', 140)).toEqual({ taxes: 0, savings: 100 })
  })
})

describe('simulateMonth', () => {
  const days = simulateMonth(MONTH_PAYMENTS, { taxes: 25, savings: 15 })

  it('covers 30 days and never shrinks', () => {
    expect(days).toHaveLength(30)
    for (let i = 1; i < days.length; i++) for (const k of ENVELOPES) {
      expect(days[i].totals[k]).toBeGreaterThanOrEqual(days[i - 1].totals[k])
    }
  })

  it('ends with every payment counted and remembers the last one', () => {
    const usd = MONTH_PAYMENTS.reduce((s, p) => s + convert(p.cents, p.currency, 'USD'), 0)
    expect(sumParts(days[29].totals)).toBe(usd)
    expect(days[29].last?.day).toBe(27)
    expect(days[1].last).toBeUndefined()
  })
})
