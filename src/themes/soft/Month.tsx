import { COPY, ENVELOPE_LABEL, MONTH_PAYMENTS, clientName } from '../../content'
import { ENVELOPES, format } from '../../domain/money'
import { RollingNumber } from '../../ui/RollingNumber'
import { MonthScene, type Day, type MonthData } from '../../ui/MonthScene'
import { Jar } from './Jar'

const PAY_DAYS = new Set(MONTH_PAYMENTS.map((m) => m.day))

function view(d: Day, { days, n, end, max, money }: MonthData) {
  return (
    <div className="month__grid">
      <div>
        <p className="label">{COPY.month.label}</p>
        <h2>Day <RollingNumber className="month__day" value={String(d.day)} /> <em>of 30</em></h2>
        <p className="month__note">
          {/* Keyed so the note re-enters each time a new payment becomes the latest. */}
          <span key={d.last?.day ?? 0}>
            {d.last
              ? <>Day {d.last.day} · <b>{clientName(d.last.client)}</b> paid {format(d.last.cents, d.last.currency)}. {COPY.month.sorted}</>
              : COPY.month.quiet}
          </span>
        </p>
        <p className={d.day === n ? 'ready ready--on' : 'ready'}>{COPY.month.ready} · <RollingNumber value={money(end.taxes, 0)} /></p>
      </div>
      <div className="card month__card">
        <div className="pills" aria-hidden="true">
          {days.map(({ day }) => {
            const cls = ['pill', PAY_DAYS.has(day) && 'pill--pay', day < d.day && 'pill--past', day === d.day && 'pill--today']
            return <span key={day} className={cls.filter(Boolean).join(' ')}>{day}</span>
          })}
        </div>
        <div className="jars">
          {ENVELOPES.map((k) => (
            <Jar key={k} k={k} level={d.totals[k] / max}>
              {/* Remounts per payment, so a fresh drop falls each time one lands. */}
              {d.last && <i key={d.last.day} className="jar__drop" />}
            </Jar>
          ))}
        </div>
        <div className="jars__labels">
          {ENVELOPES.map((k) => (
            <div key={k}>
              <b>{ENVELOPE_LABEL[k]}</b>
              <RollingNumber className="jars__v" value={money(d.totals[k], 0)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const Month = () => <MonthScene view={view} />
