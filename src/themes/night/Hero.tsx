import { useRef, useState } from 'react'
import { COPY, ENVELOPE_LABEL } from '../../content'
import { ENVELOPES, convert, format, formatHome, rate, shares, split, sumParts, type Parts } from '../../domain/money'
import { useStore, type Payment } from '../../state/store'
import { Flows, type FlowsHandle } from '../../ui/Flows'
import { PaymentQueue } from '../../ui/PaymentQueue'
import { RollingNumber } from '../../ui/RollingNumber'
import { HomeCurrency } from '../../ui/HomeCurrency'
import { useAutoplay } from '../../ui/useAutoplay'
import { replay, wait } from '../../ui/motion'

interface Landing { p: Payment; shown: string; fx?: string; out?: boolean }

export function Hero() {
  const [s, dispatch] = useStore()
  const root = useRef<HTMLElement>(null)
  const total = useRef<HTMLParagraphElement>(null)
  const beam = useRef<HTMLSpanElement>(null)
  const cols = useRef<HTMLDivElement>(null)
  const flows = useRef<FlowsHandle>(null)
  const [landing, setLanding] = useState<Landing | null>(null)
  // Columns keep showing the old balances until the beams reach them, one beat after the total.
  const [held, setHeld] = useState<Parts | null>(null)
  const [hit, setHit] = useState(false)

  const shown = held ?? s.balances
  const pct = shares(s.rules)
  const money = (usd: number) => formatHome(usd, s.home)

  async function route(p: Payment, signal: AbortSignal) {
    setLanding({ p, shown: format(p.cents, p.currency) })
    await wait(700, signal)
    if (p.currency !== s.home) {
      setLanding({ p, shown: format(convert(p.cents, p.currency, s.home), s.home), fx: `${p.currency}→${s.home} ${rate(p.currency, s.home).toFixed(4)}` })
      await wait(600, signal)
    }
    if (beam.current) replay(beam.current, 'beam--go')
    await wait(420, signal)
    setHeld(s.balances)
    dispatch({ type: 'route', key: p.key })
    if (total.current) replay(total.current, 'total--flash')
    await wait(500, signal)
    flows.current?.run(split(convert(p.cents, p.currency, 'USD'), s.rules))
    await wait(500, signal)
    setHeld(null)
    setHit(true)
    await wait(1700, signal)
    setHit(false)
    setLanding((l) => l && { ...l, out: true })
    await wait(250, signal)
    setLanding(null)
  }

  useAutoplay(root, route)

  return (
    <section ref={root} className="hero">
      <p className="hero__kicker">Runnel · {COPY.hero.eyebrow}</p>
      <h1 className="hero__title">Money in. <span>Sorted out.</span></h1>
      <p className="hero__lede">{COPY.hero.lede}</p>

      <div className="queue">
        <p className="queue__label">{COPY.hero.incoming}</p>
        <PaymentQueue landing={landing?.p.key} />
      </div>

      <div className="slot">
        {landing && (
          <p className={landing.out ? 'landed landed--out' : 'landed'}>
            <span className="landed__dot" />
            <span className="landed__who">{landing.p.name}</span>
            <RollingNumber className="landed__amt" value={landing.shown} />
            {landing.fx && <span className="landed__fx">{landing.fx}</span>}
          </p>
        )}
      </div>
      <span ref={beam} className="beam" aria-hidden="true" />

      <div className="balance">
        <p className="balance__label">
          {COPY.hero.total}
          <HomeCurrency />
        </p>
        <p ref={total} className="total"><RollingNumber value={money(sumParts(s.balances))} /></p>
      </div>

      <Flows ref={flows} targets={cols} className="hero__flows" />

      <div ref={cols} className="cols">
        {ENVELOPES.map((k) => (
          <div key={k} className={hit ? 'col col--hit' : 'col'} data-k={k}>
            <span className="col__k">{ENVELOPE_LABEL[k]} · {pct[k]}%</span>
            <RollingNumber className="col__v" value={money(shown[k])} />
          </div>
        ))}
      </div>

      <div className="hero__ctas">
        <a className="btn btn--primary" href="#waitlist">{COPY.hero.cta}</a>
        <a className="btn" href="#rules">{COPY.hero.secondary}</a>
      </div>
    </section>
  )
}
