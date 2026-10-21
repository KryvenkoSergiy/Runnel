import type { CSSProperties } from 'react'
import { COPY, ENVELOPE_LABEL, MONTH_PAYMENTS, clientName } from '../../content'
import { ENVELOPES, format } from '../../domain/money'
import { RollingNumber } from '../../ui/RollingNumber'
import { MonthScene, type Day, type MonthData } from '../../ui/MonthScene'

const pad = (n: number) => String(n).padStart(2, '0')

function view(d: Day, { n, end, max, money }: MonthData) {
  return (
    <div className="month__grid">
      <p className="label month__label">{COPY.month.label}</p>
      <h2 className="month__poster">
        <span className="sr">Day </span>
        <RollingNumber className="month__day" value={pad(d.day)} />
        <span className="month__of">/30</span>
      </h2>
      <ol className="month__rows">
        {MONTH_PAYMENTS.map((m, i) => (
          <li key={m.day} className={m.day <= d.day ? 'month__row month__row--in' : 'month__row'} aria-current={d.last === m || undefined}>
            <span>{pad(i + 1)}</span>
            <span>Day {pad(m.day)}</span>
            <b>{clientName(m.client)}</b>
            <span>{format(m.cents, m.currency)}</span>
          </li>
        ))}
        <li className={d.day === n ? 'month__row month__row--in month__ready' : 'month__row month__ready'}>
          <span>→</span>
          <span>Day 30</span>
          <b>{COPY.month.ready}</b>
          <RollingNumber value={money(end.taxes, 0)} />
        </li>
      </ol>
      <div className="month__bars">
        {ENVELOPES.map((k, i) => (
          <div key={k} className="month__bar" data-k={k}>
            <span className="month__k">{pad(i + 1)} {ENVELOPE_LABEL[k]}</span>
            <i style={{ '--w': (d.totals[k] / max).toFixed(3) } as CSSProperties} />
            <RollingNumber className="month__v" value={money(d.totals[k], 0)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export const Month = () => <MonthScene view={view} />
