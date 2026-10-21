import { useRef, useState } from 'react'
import { COPY, ENVELOPE_LABEL, initials } from '../../content'
import { ENVELOPES, convert, format, formatHome, rate, split, sumParts, type Envelope, type Parts } from '../../domain/money'
import { useStore, type Payment } from '../../state/store'
import { PaymentQueue } from '../../ui/PaymentQueue'
import { RollingNumber } from '../../ui/RollingNumber'
import { HomeCurrency } from '../../ui/HomeCurrency'
import { useAutoplay } from '../../ui/useAutoplay'
import { reducedMotion, replay, wait } from '../../ui/motion'
import { Jar } from './Jar'

interface Landing { p: Payment; shown: string; fx?: string; out?: boolean }

/** USD cents per jar. A jar that passes its goal fills to the brim and starts over with the remainder. */
const GOAL: Parts = { taxes: 600000, savings: 1000000, spendable: 1200000 }
const level = (k: Envelope, usd: number) => (usd % GOAL[k]) / GOAL[k]

export function Hero() {
  const [s, dispatch] = useStore()
  const root = useRef<HTMLElement>(null)
  const glass = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLParagraphElement>(null)
  const [landing, setLanding] = useState<Landing | null>(null)
  // Jars keep the old balances until their drop lands.
  const [held, setHeld] = useState<Parts | null>(null)
  const [brim, setBrim] = useState<Partial<Record<Envelope, boolean>>>({})

  const shown = held ?? s.balances
  const money = (usd: number, digits?: number) => formatHome(usd, s.home, digits)

  async function pour(k: Envelope, n: number, from: number, add: number, signal: AbortSignal) {
    await wait(n * 150, signal)
    const card = glass.current
    const jar = card?.querySelector<HTMLElement>(`.jar[data-k="${k}"]`)
    if (!card || !jar) return
    if (!reducedMotion() && bubble.current) {
      const c = card.getBoundingClientRect()
      const b = bubble.current.getBoundingClientRect()
      const j = jar.getBoundingClientRect()
      const x0 = b.left + b.width / 2 - c.left
      const y0 = b.bottom - c.top
      const x1 = j.left + j.width / 2 - c.left
      const y1 = j.bottom - j.height * level(k, from) - c.top
      const drop = document.createElement('i')
      drop.className = 'drop'
      drop.dataset.k = k
      card.append(drop)
      const a = drop.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(.3)`, opacity: 0 },
        { transform: `translate(${x0 + (x1 - x0) * 0.15}px, ${y0 + 6}px) scale(1)`, opacity: 1, offset: 0.2, easing: 'cubic-bezier(.55,0,1,.45)' },
        { transform: `translate(${x1}px, ${y1}px) scale(.9, 1.15)`, opacity: 1 },
      ], { duration: 700, fill: 'forwards' })
      await a.finished.catch(() => {})
      drop.remove()
    }
    const wraps = level(k, from + add) < level(k, from)
    setHeld((h) => h && { ...h, [k]: from + add })
    replay(jar, 'jar--splash')
    if (wraps) {
      setBrim((b) => ({ ...b, [k]: true }))
      await wait(900, signal)
      setBrim((b) => ({ ...b, [k]: false }))
    }
  }

  async function route(p: Payment, signal: AbortSignal) {
    setLanding({ p, shown: format(p.cents, p.currency) })
    await wait(800, signal)
    if (p.currency !== s.home) {
      setLanding({ p, shown: format(convert(p.cents, p.currency, s.home), s.home), fx: `${p.currency} → ${s.home} · ${rate(p.currency, s.home).toFixed(4)}` })
      await wait(800, signal)
    }
    const parts = split(convert(p.cents, p.currency, 'USD'), s.rules)
    const from = s.balances
    setHeld(from)
    dispatch({ type: 'route', key: p.key })
    await Promise.all(ENVELOPES.map((k, n) => pour(k, n, from[k], parts[k], signal)))
    await wait(1400, signal)
    setLanding((l) => l && { ...l, out: true })
    await wait(400, signal)
    setLanding(null)
    setHeld(null)
  }

  useAutoplay(root, route)

  return (
    <section ref={root} className="hero">
      <div className="blobs" aria-hidden="true"><i /><i /><i /></div>
      <div className="hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow">{COPY.hero.eyebrow}</p>
          <h1 className="hero__title">Watch your money <em>find its place.</em></h1>
          <p className="hero__lede">{COPY.hero.lede}</p>
          <div className="hero__ctas">
            <a className="btn btn--primary" href="#waitlist">{COPY.hero.cta}</a>
            <a className="btn" href="#rules">{COPY.hero.secondary}</a>
          </div>
          <div className="queue">
            <p className="queue__label">{COPY.hero.incoming}</p>
            <PaymentQueue landing={landing?.p.key} />
          </div>
        </div>

        <div ref={glass} className="glass">
          <div className="glass__top">
            <p className="glass__total">{COPY.hero.total} <RollingNumber value={money(sumParts(s.balances))} /></p>
            <HomeCurrency />
          </div>
          <div className="slot">
            {landing ? (
              <p ref={bubble} className={landing.out ? 'bubble bubble--out' : 'bubble'}>
                <span className="avatar" data-client={landing.p.id}>{initials(landing.p.name)}</span>
                <span className="bubble__text">
                  <RollingNumber className="bubble__amt" value={landing.shown} />
                  <small>{landing.fx ?? landing.p.name}</small>
                </span>
              </p>
            ) : <span className="slot__hint">{COPY.hero.slot}</span>}
          </div>
          <div className="jars">
            {ENVELOPES.map((k) => <Jar key={k} k={k} level={level(k, shown[k])} brim={brim[k]} />)}
          </div>
          <div className="jars__labels">
            {ENVELOPES.map((k) => (
              <div key={k}>
                <b>{ENVELOPE_LABEL[k]}</b>
                <RollingNumber className="jars__v" value={money(shown[k], 0)} />
                <small>{brim[k] ? 'Goal reached' : `${Math.round(level(k, shown[k]) * 100)}% of ${k === 'taxes' ? 'Q4 goal' : 'goal'}`}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
