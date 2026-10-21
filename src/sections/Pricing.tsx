import { COPY, PLANS, YEARLY_SAVING } from '../content'
import { useStore } from '../state/store'
import { RollingNumber } from '../ui/RollingNumber'
import { Segmented } from '../ui/Segmented'
import { Heading } from './Heading'

const BILLING = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: <>Yearly <span className="pricing__save">{YEARLY_SAVING}</span></> },
] as const

export function Pricing() {
  const [s, dispatch] = useStore()
  return (
    <section className="block pricing" id="pricing">
      <div className="pricing__head reveal">
        <div>
          <p className="label">{COPY.pricing.label}</p>
          <Heading text={COPY.pricing.title} />
        </div>
        <Segmented label="Billing period" options={BILLING} value={s.billing} onChange={(billing) => dispatch({ type: 'setBilling', billing })} />
      </div>
      <div className="pricing__plans reveal">
        {PLANS.map((p) => (
          <article key={p.id} className={p.popular ? 'card pricing__plan pricing__plan--popular' : 'card pricing__plan'}>
            <h3>{p.name}{p.popular && <span className="pricing__tag">Popular</span>}</h3>
            <p className="pricing__price"><RollingNumber value={`$${p.price[s.billing]}`} /><small>/ month</small></p>
            <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <a className={p.popular ? 'btn btn--primary' : 'btn'} href="#waitlist">Join waitlist</a>
          </article>
        ))}
      </div>
    </section>
  )
}
