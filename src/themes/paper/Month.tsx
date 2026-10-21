import type { CSSProperties } from 'react'
import { COPY, ENVELOPE_LABEL, MONTH_PAYMENTS, clientName } from '../../content'
import { ENVELOPES, format } from '../../domain/money'
import { RollingNumber } from '../../ui/RollingNumber'
import { MonthScene, type Day, type MonthData } from '../../ui/MonthScene'

const PAY_DAYS = new Set(MONTH_PAYMENTS.map((m) => m.day))

function view(d: Day, { days, end, max, money }: MonthData) {
  return (
    <div className="month__grid">
      <div>
        <p className="label">{COPY.month.label}</p>
        <h2>Day <RollingNumber className="month__day" value={String(d.day)} /> <em>of 30</em></h2>
        <div className="cal" aria-hidden="true">
          {days.map(({ day }) => {
            const cls = ['cal__d', PAY_DAYS.has(day) && 'cal__d--pay', day < d.day && 'cal__d--past', day === d.day && 'cal__d--today']
            return <span key={day} className={cls.filter(Boolean).join(' ')} />
          })}
        </div>
        <p className="month__note">
          {/* Keyed so the note re-enters each time a new payment becomes the latest. */}
          <span key={d.last?.day ?? 0}>
            {d.last
              ? <>Day {d.last.day} · <b>{clientName(d.last.client)}</b> paid {format(d.last.cents, d.last.currency)}. {COPY.month.sorted}</>
              : COPY.month.quiet}
          </span>
        </p>
      </div>
      <div className="card month__card">
        <div className="tubes" aria-hidden="true">
          {ENVELOPES.map((k) => (
            <div key={k} className="tube" data-k={k}><b style={{ '--h': `${((d.totals[k] / max) * 100).toFixed(1)}%` } as CSSProperties} /></div>
          ))}
        </div>
        <div className="tubes__legend">
          {ENVELOPES.map((k) => (
            <div key={k}>
              <span className="tubes__k"><span className="key-dot" data-k={k} />{ENVELOPE_LABEL[k]}</span>
              <RollingNumber className="tubes__v" value={money(d.totals[k], 0)} />
            </div>
          ))}
        </div>
        <div className={d.day === days.length ? 'ready ready--on' : 'ready'}>
          <span>{COPY.month.ready}</span>
          <RollingNumber value={money(end.taxes)} />
        </div>
      </div>
    </div>
  )
}

export const Month = () => <MonthScene view={view} />
