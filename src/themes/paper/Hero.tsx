import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import { COPY, ENVELOPE_LABEL, initials } from '../../content'
import { ENVELOPES, convert, format, formatHome, rate, shares, split, sumParts } from '../../domain/money'
import { useStore, type Payment } from '../../state/store'
import { Flows, type FlowsHandle } from '../../ui/Flows'
import { Mark } from '../../ui/Mark'
import { PaymentQueue } from '../../ui/PaymentQueue'
import { RollingNumber } from '../../ui/RollingNumber'
import { HomeCurrency } from '../../ui/HomeCurrency'
import { useAutoplay } from '../../ui/useAutoplay'
import { reducedMotion, replay, wait } from '../../ui/motion'

interface Landing { p: Payment; shown: string; fx?: string; out?: boolean }

const i = (n: number) => ({ '--i': n }) as CSSProperties

export function Hero() {
  const [s, dispatch] = useStore()
  const hero = useRef<HTMLElement>(null)
  const envs = useRef<HTMLDivElement>(null)
  const flows = useRef<FlowsHandle>(null)
  const [landing, setLanding] = useState<Landing | null>(null)

  const total = sumParts(s.balances)
  const pct = shares(s.rules)
  useAutoplay(hero, route)

  // Magnetic primary buttons: a mouse-only flourish, so touch and reduced motion skip it.
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || reducedMotion()) return
    const offs = [...document.querySelectorAll<HTMLElement>('.nav__cta, .hero .btn--primary')].map((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.22}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`
      }
      const leave = () => { el.style.translate = '' }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
        leave()
      }
    })
    return () => offs.forEach((off) => off())
  }, [])

  async function route(p: Payment, signal: AbortSignal) {
    // FLIP instead of a View Transition: the landed card starts where the chip was and glides into the slot.
    // Only transform and clip-path move, so the page never pauses or reflows, and nothing is stretched.
    const chip = hero.current?.querySelector(`.chip[data-key="${p.key}"]`)
    const from = chip?.getBoundingClientRect()
    flushSync(() => setLanding({ p, shown: format(p.cents, p.currency) }))
    const landed = hero.current?.querySelector<HTMLElement>('.landed')
    if (from && landed && !reducedMotion()) {
      const to = landed.getBoundingClientRect()
      await landed.animate([
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`, clipPath: `inset(0 ${Math.max(0, to.width - from.width)}px 0 0 round 12px)`, opacity: 0.6 },
        { transform: 'none', clipPath: 'inset(0 0 0 0 round 12px)', opacity: 1 },
      ], { duration: 620, easing: 'cubic-bezier(.22, 1, .36, 1)' }).finished.catch(() => {})
    }
    if (p.currency !== s.home) {
      await wait(250, signal)
      setLanding({ p, shown: format(convert(p.cents, p.currency, s.home), s.home), fx: `${p.currency} → ${s.home} · ${rate(p.currency, s.home).toFixed(4)}` })
      await wait(800, signal)
    }
    flows.current?.run(split(convert(p.cents, p.currency, 'USD'), s.rules))
    await wait(420, signal)
    dispatch({ type: 'route', key: p.key })
    envs.current?.querySelectorAll('.env').forEach((e) => replay(e, 'env--hit'))
    await wait(1500, signal)
    setLanding((l) => l && { ...l, out: true })
    await wait(300, signal)
    setLanding(null)
  }

  return (
    <section ref={hero} className="hero">
      <div className="hero__copy">
        <span className="hero__eyebrow"><span className="hero__dot" />{COPY.hero.eyebrow}</span>
        <h1 className="hero__title">
          <span className="w" style={i(0)}>Every</span> <span className="w" style={i(1)}>payment,</span><br />
          <em className="w" style={i(2)}>already</em> <em className="w" style={i(3)}>sorted.</em>
        </h1>
        <p className="hero__lede">{COPY.hero.lede}</p>
        <div className="hero__ctas">
          <a className="btn btn--primary" href="#waitlist">{COPY.hero.cta} <span className="hero__arrow" aria-hidden="true">→</span></a>
          <a className="btn" href="#rules">{COPY.hero.secondary}</a>
        </div>

        <div className="queue">
          <p className="label queue__label">{COPY.hero.incoming}</p>
          <PaymentQueue landing={landing?.p.key} />
        </div>
      </div>

      <div className="stage">
        <div className="aura" aria-hidden="true" />
        <div className="app">
          <div className="app__top">
            <span className="app__brand"><Mark size={18} />Runnel</span>
            <HomeCurrency />
          </div>

          <p className="app__total-label">{COPY.hero.total}</p>
          <p className="app__total"><RollingNumber value={formatHome(total, s.home)} /></p>

          <div className={landing ? 'drop drop--filled' : 'drop'}>
            <span className="drop__hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" /></svg>
              {COPY.hero.slot}
            </span>
            {landing && (
              <div className={landing.out ? 'landed landed--out' : 'landed'}>
                <span className="avatar" data-client={landing.p.id}>{initials(landing.p.name)}</span>
                <span className="landed__info"><span className="landed__who">{landing.p.name}</span><span className="landed__what">{landing.p.what}</span></span>
                <span className="landed__amt"><RollingNumber value={landing.shown} /><span className="landed__fx">{landing.fx}</span></span>
              </div>
            )}
          </div>

          <Flows ref={flows} targets={envs} />

          <div ref={envs} className="envs">
            {ENVELOPES.map((k) => (
              <div key={k} className="env" data-k={k}>
                <span className="env__k"><i className="key-dot" data-k={k} />{ENVELOPE_LABEL[k]}<span className="env__pct">{pct[k]}%</span></span>
                <RollingNumber className="env__v" value={formatHome(s.balances[k], s.home, 0)} />
                <span className="env__bar"><b style={{ '--w': `${((s.balances[k] / total) * 100).toFixed(1)}%` } as CSSProperties} /></span>
              </div>
            ))}
          </div>

          <div className="hist">
            <p className="label">{COPY.hero.recent}</p>
            <ul>
              {s.history.slice(0, 3).map((h) => (
                <li key={h.key} className={h.when === 'now' ? 'hist__row hist__row--new' : 'hist__row'}>
                  <span className="avatar" data-client={h.id}>{initials(h.name)}</span>
                  <span className="hist__who">{h.name}</span>
                  <span className="hist__amt">+{format(h.cents, h.currency)}</span>
                  <span className="hist__when">{h.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
