import type { CSSProperties } from 'react'
import { COPY, ENVELOPE_LABEL, MONTH_PAYMENTS, clientName } from '../../content'
import { ENVELOPES, format, spendablePct, type Envelope } from '../../domain/money'
import { useStore } from '../../state/store'
import { RollingNumber } from '../../ui/RollingNumber'
import { MonthScene, type Day, type MonthData } from '../../ui/MonthScene'

const W = 300
const H = 160
const pad = (n: number) => String(n).padStart(2, '0')
const LANE: Record<Envelope, number> = { taxes: -2.5, savings: 0, spendable: 2.5 }

export function Month() {
  const [s] = useStore()
  const ratio = `${s.rules.taxes}/${s.rules.savings}/${spendablePct(s.rules)}`

  const view = (d: Day, { days, n, end, max, money }: MonthData) => {
    const x = (day: number) => ((day - 1) / (n - 1)) * W
    // Like lines on a metro map, each envelope runs slightly offset (in viewBox units), so equal balances
    // draw as parallel lines of different colours instead of one line hiding the other.
    const y = (v: number, k: Envelope) => H - (v / max) * H * 0.92 + LANE[k]
    // Step lines: money arrives on a day and stays, so each envelope is flat between payments.
    const path = (k: Envelope) => days.map((t, i) => {
      const yy = y(t.totals[k], k).toFixed(1)
      return i === 0 ? `M0 ${yy}` : `H${x(t.day).toFixed(1)} V${yy}`
    }).join(' ')
    const at = ((d.day - 1) / (n - 1)) * 100
    return (
      <div className="month__grid">
        <div className="month__copy">
          <p className="label">{COPY.month.label}</p>
          <h2>Day <RollingNumber className="month__day" value={pad(d.day)} /> <em>/ 30</em></h2>
          <ol className="log">
            <li className="log__line">Day 01 · {COPY.month.quiet}</li>
            {MONTH_PAYMENTS.filter((m) => m.day <= d.day).map((m) => (
              <li key={m.day} className="log__line">
                Day {pad(m.day)} · <b>{clientName(m.client)}</b> · {format(m.cents, m.currency)} → split {ratio}
              </li>
            ))}
            {d.day === n && <li className="log__line log__line--ready">Day 30 · {COPY.month.ready} · {money(end.taxes)}</li>}
            <li className="log__caret" aria-hidden="true">_</li>
          </ol>
        </div>
        <div className="chart card">
          <div className="chart__plot" style={{ '--at': `${at}%` } as CSSProperties}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              {[0.25, 0.5, 0.75].map((f) => <line key={f} className="chart__grid" x1="0" x2={W} y1={H * f} y2={H * f} />)}
              <g className="chart__lines">
                {ENVELOPES.map((k) => <path key={k} data-k={k} d={path(k)} />)}
              </g>
            </svg>
            {ENVELOPES.map((k) => (
              <i key={k} className="chart__head" data-k={k} style={{ top: `${(y(d.totals[k], k) / H) * 100}%` }} />
            ))}
            <i className="chart__now" />
          </div>
          <div className="chart__legend">
            {ENVELOPES.map((k) => (
              <div key={k} data-k={k}>
                <span className="chart__k">{ENVELOPE_LABEL[k]}</span>
                <RollingNumber className="chart__v" value={money(d.totals[k], 0)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <MonthScene view={view} />
}
