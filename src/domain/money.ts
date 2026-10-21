// All amounts are integer minor units (cents). Floats only appear inside a single rounding step.

export type Currency = 'USD' | 'EUR' | 'GBP' | 'UAH'
export const CURRENCIES: readonly Currency[] = ['USD', 'EUR', 'GBP', 'UAH']

export type Envelope = 'taxes' | 'savings' | 'spendable'
export const ENVELOPES: readonly Envelope[] = ['taxes', 'savings', 'spendable']
export type Parts = Record<Envelope, number>

/** Balances are kept in USD cents; this shows them in the reader's home currency. */
export const formatHome = (usd: number, home: Currency, digits?: number) => format(convert(usd, 'USD', home), home, digits)

/** Value of one unit in USD. Fixed on purpose: the UI labels them "demo rates". */
const DEMO_RATES: Record<Currency, number> = { USD: 1, EUR: 1.09, GBP: 1.27, UAH: 0.024 }

export const convert = (cents: number, from: Currency, to: Currency) =>
  from === to ? cents : Math.round((cents * DEMO_RATES[from]) / DEMO_RATES[to])

export const rate = (from: Currency, to: Currency) => DEMO_RATES[from] / DEMO_RATES[to]

const formatters = new Map<string, Intl.NumberFormat>()
export function format(cents: number, currency: Currency, digits = 2) {
  const key = currency + digits
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    formatters.set(key, f)
  }
  return f.format(cents / 100)
}

/** Percentages; spendable is whatever is left. */
export interface Rules { taxes: number; savings: number }

/** Sets one rule and, if the sum would pass 100, takes the excess from the other one. */
export function withRule(rules: Rules, key: keyof Rules, value: number): Rules {
  const v = Math.min(100, Math.max(0, value))
  const other = key === 'taxes' ? 'savings' : 'taxes'
  const next = { ...rules, [key]: v }
  next[other] = Math.min(rules[other], 100 - v)
  return next
}

export const spendablePct = (r: Rules) => 100 - r.taxes - r.savings

/** Each envelope's percentage. */
export const shares = (r: Rules): Record<Envelope, number> => ({ taxes: r.taxes, savings: r.savings, spendable: spendablePct(r) })

export function split(total: number, rules: Rules): Parts {
  // Floor both shares so the rounding remainder always lands in spendable and parts sum to total.
  const taxes = Math.floor((total * rules.taxes) / 100)
  const savings = Math.floor((total * rules.savings) / 100)
  return { taxes, savings, spendable: total - taxes - savings }
}

export const addParts = (a: Parts, b: Parts): Parts => ({
  taxes: a.taxes + b.taxes,
  savings: a.savings + b.savings,
  spendable: a.spendable + b.spendable,
})

export const sumParts = (p: Parts) => p.taxes + p.savings + p.spendable

export interface DatedPayment { day: number; cents: number; currency: Currency }
export interface MonthDay<P extends DatedPayment> { day: number; totals: Parts; last?: P }

/** Envelope totals in USD cents at the end of each day 1..days. */
export function simulateMonth<P extends DatedPayment>(payments: readonly P[], rules: Rules, days = 30): MonthDay<P>[] {
  const out: MonthDay<P>[] = []
  let totals: Parts = { taxes: 0, savings: 0, spendable: 0 }
  let last: P | undefined
  for (let day = 1; day <= days; day++) {
    for (const p of payments) {
      if (p.day !== day) continue
      totals = addParts(totals, split(convert(p.cents, p.currency, 'USD'), rules))
      last = p
    }
    out.push({ day, totals, last })
  }
  return out
}
