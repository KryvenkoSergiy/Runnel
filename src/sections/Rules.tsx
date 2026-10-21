import type { CSSProperties } from 'react'
import { COPY, ENVELOPE_LABEL, EXAMPLE_CENTS } from '../content'
import { ENVELOPES, convert, format, split, type Rules as RuleSet } from '../domain/money'
import { useStore } from '../state/store'
import { RollingNumber } from '../ui/RollingNumber'
import { Heading } from './Heading'

const MAX = 60

export function Rules() {
  const [s, dispatch] = useStore()
  const total = convert(EXAMPLE_CENTS, 'USD', s.home)
  const parts = split(total, s.rules)

  return (
    <section className="block rules" id="rules">
      <div className="rules__copy reveal">
        <p className="label">{COPY.rules.label}</p>
        <Heading text={COPY.rules.title} />
        <p className="sub">{COPY.rules.sub}</p>
        <div className="rules__sliders">
          {(['taxes', 'savings'] as const satisfies (keyof RuleSet)[]).map((k) => {
            const v = s.rules[k]
            return (
              <label key={k} className="rules__slider" data-k={k}>
                <span className="rules__slider-top">
                  <span className="key-dot" data-k={k} />
                  {ENVELOPE_LABEL[k]}
                  <output>{v}%</output>
                </span>
                <input
                  type="range" min={0} max={MAX} step={1} value={v}
                  aria-valuetext={`${v}% to ${k}`}
                  style={{ '--p': `${(v / MAX) * 100}%` } as CSSProperties}
                  onChange={(e) => dispatch({ type: 'setRule', key: k, value: +e.target.value })}
                />
              </label>
            )
          })}
        </div>
      </div>
      <div className="rules__example card reveal">
        <p className="rules__lead">From a <RollingNumber value={format(total, s.home, 0)} /> payment you get</p>
        <div className="rules__stack" aria-hidden="true">
          {ENVELOPES.map((k) => <b key={k} data-k={k} style={{ '--f': total ? parts[k] / total : 0 } as CSSProperties} />)}
        </div>
        <dl className="rules__rows">
          {ENVELOPES.map((k) => (
            <div key={k}>
              <dt><span className="key-dot" data-k={k} />{ENVELOPE_LABEL[k]}</dt>
              <dd><RollingNumber value={format(parts[k], s.home)} instant /></dd>
            </div>
          ))}
        </dl>
        <p className="fine">{COPY.rules.fine}</p>
      </div>
    </section>
  )
}
