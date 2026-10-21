import { useRef, useState, type CSSProperties } from 'react'
import { CLIENTS, COPY } from '../../content'
import { ENVELOPES, convert, format, formatHome, rate, shares, split, type Parts } from '../../domain/money'
import { useStore, type Payment } from '../../state/store'
import { PaymentQueue } from '../../ui/PaymentQueue'
import { RollingNumber } from '../../ui/RollingNumber'
import { HomeCurrency } from '../../ui/HomeCurrency'
import { useAutoplay } from '../../ui/useAutoplay'
import { wait } from '../../ui/motion'

interface Landing { p: Payment; amount: string; conv: string }

const LINES = ['Split', 'every', 'payment']
const SEG_LABEL = { taxes: 'Taxes', savings: 'Save', spendable: 'Spendable' } as const
const TOTAL_LABEL = { taxes: 'Taxes total', savings: 'Saved', spendable: 'Yours to spend' } as const
// Four copies so the tape can loop by sliding exactly half its width.
const TAPE = [...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS]

export function Hero() {
  const [s, dispatch] = useStore()
  const root = useRef<HTMLElement>(null)
  const [landing, setLanding] = useState<Landing | null>(null)
  // How many bar segments are filled, and with which payment's parts (USD cents).
  const [filled, setFilled] = useState(0)
  const [parts, setParts] = useState<Parts>({ taxes: 0, savings: 0, spendable: 0 })

  const pct = shares(s.rules)
  const money = (usd: number) => formatHome(usd, s.home)

  async function route(p: Payment, signal: AbortSignal) {
    if (filled) {
      // Curtains wipe out to the right before the next payment fills them again.
      setFilled(0)
      await wait(500, signal)
    }
    const usd = convert(p.cents, p.currency, 'USD')
    const home = convert(p.cents, p.currency, s.home)
    setLanding({
      p,
      amount: `+${format(p.cents, p.currency)}`,
      conv: p.currency === s.home ? `= already in ${s.home}` : `= ${format(home, s.home)} at ${rate(p.currency, s.home).toFixed(4)}`,
    })
    await wait(900, signal)
    setParts(split(usd, s.rules))
    for (let n = 1; n <= ENVELOPES.length; n++) {
      setFilled(n)
      await wait(240, signal)
    }
    await wait(400, signal)
    dispatch({ type: 'route', key: p.key })
    await wait(600, signal)
  }

  useAutoplay(root, route)

  return (
    <section ref={root} className="hero">
      <div className="tape" aria-hidden="true">
        <div className="tape__track">
          {TAPE.map((c, n) => <span key={n}>{c.name} <b>{format(c.cents, c.currency)}</b></span>)}
        </div>
      </div>

      <div className="hero__grid">
        <h1 className="hero__title">
          {LINES.map((w, n) => (
            <span key={w} className="hero__line"><span style={{ '--i': n } as CSSProperties}>{w}{n === LINES.length - 1 && <em>.</em>}</span></span>
          ))}
        </h1>

        <div className="side">
          <p className="side__no">{COPY.hero.incoming}</p>
          <PaymentQueue landing={landing?.p.key} />
          {/* Always rendered so the bar below never jumps when a payment lands. */}
          <div className="landed" key={landing?.p.key}>
            {landing && <>
              <p className="landed__who">{landing.p.name} — {landing.p.what}</p>
              <p className="landed__amt">{landing.amount}</p>
              <p className="landed__conv">{landing.conv}</p>
            </>}
          </div>
        </div>

        <div className="bar">
          {ENVELOPES.map((k, n) => (
            <div key={k} className={n < filled ? 'seg-k seg-k--on' : 'seg-k'} data-k={k} style={{ '--f': pct[k] } as CSSProperties}>
              <i className="seg-k__fill" />
              <span className="seg-k__l">{String(n + 1).padStart(2, '0')} {SEG_LABEL[k]} {pct[k]}%</span>
              <RollingNumber className="seg-k__v" value={money(parts[k])} />
            </div>
          ))}
        </div>

        <div className="totals">
          {ENVELOPES.map((k) => (
            <div key={k} style={{ '--f': Math.max(pct[k], 14) } as CSSProperties}>
              <small>{TOTAL_LABEL[k]}</small>
              <RollingNumber value={money(s.balances[k])} />
            </div>
          ))}
        </div>

        <div className="hero__foot">
          <HomeCurrency />
          <p className="hero__lede">{COPY.hero.lede}</p>
          <div className="hero__ctas">
            <a className="btn btn--primary" href="#waitlist">{COPY.hero.cta}</a>
            <a className="btn" href="#rules">{COPY.hero.secondary}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
