import { useMemo, useRef, type ReactNode } from 'react'
import { MONTH_PAYMENTS, type MonthPayment } from '../content'
import { ENVELOPES, formatHome, simulateMonth, type MonthDay, type Parts } from '../domain/money'
import { useStore } from '../state/store'
import { useReducedMotion } from './motion'
import { useScrollProgress } from './useScrollProgress'

export type Day = MonthDay<MonthPayment>

export interface MonthData {
  days: Day[]
  n: number
  /** Envelope totals on the last day; `max` is the largest, for scaling bars and lines. */
  end: Parts
  max: number
  money: (usd: number, digits?: number) => string
}

/** Day indexes shown as still frames instead of a pinned scroll scene under reduced motion. */
const STILLS = [0, 9, 19, 29]

/**
 * "A month with Runnel", shared by every look: a tall section whose sticky frame shows the day the scroll
 * has reached. A look only draws one frame with `view(day, month)`. Under reduced motion the section
 * renders four still frames (`month--still`) instead.
 */
export function MonthScene({ view }: { view: (day: Day, month: MonthData) => ReactNode }) {
  const [s] = useStore()
  const ref = useRef<HTMLElement>(null)
  const progress = useScrollProgress(ref)
  const still = useReducedMotion()
  const days = useMemo(() => simulateMonth(MONTH_PAYMENTS, s.rules), [s.rules])
  const n = days.length
  const end = days[n - 1].totals
  const month: MonthData = {
    days,
    n,
    end,
    max: Math.max(...ENVELOPES.map((k) => end[k])) || 1,
    money: (usd, digits) => formatHome(usd, s.home, digits),
  }
  const frames = still ? STILLS.map((i) => days[i]) : [days[Math.min(n - 1, Math.floor(progress * n))]]

  return (
    <section ref={ref} className={still ? 'month month--still' : 'month'} id="month">
      {frames.map((d) => <div key={still ? d.day : 'live'} className="month__sticky">{view(d, month)}</div>)}
    </section>
  )
}
