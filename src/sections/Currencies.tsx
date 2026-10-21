import { CLIENTS, COPY, initials } from '../content'
import { convert, format, rate } from '../domain/money'
import { useStore } from '../state/store'
import { RollingNumber } from '../ui/RollingNumber'
import { HomeCurrency } from '../ui/HomeCurrency'
import { Heading } from './Heading'

export function Currencies() {
  const [s] = useStore()
  return (
    <section className="block currencies" id="currencies">
      <div className="currencies__head reveal">
        <div>
          <p className="label">{COPY.currencies.label}</p>
          <Heading text={COPY.currencies.title} />
        </div>
        <HomeCurrency />
      </div>
      <ul className="currencies__list reveal">
        {CLIENTS.map((c) => (
          <li key={c.id}>
            <span className="avatar" data-client={c.id}>{initials(c.name)}</span>
            <span className="currencies__who"><span>{c.name}</span><small>{c.what}</small></span>
            <span className="currencies__from">{format(c.cents, c.currency)}</span>
            <span className="currencies__rate">{c.currency === s.home ? '—' : `× ${rate(c.currency, s.home).toFixed(4)}`}</span>
            <RollingNumber className="currencies__to" value={format(convert(c.cents, c.currency, s.home), s.home)} />
          </li>
        ))}
      </ul>
      <p className="fine">{COPY.currencies.fine}</p>
    </section>
  )
}
