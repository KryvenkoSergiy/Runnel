import { COPY, FAQ } from '../content'
import { Heading } from './Heading'

export function Faq() {
  return (
    <section className="block faq" id="faq">
      <p className="label reveal">{COPY.faq.label}</p>
      <div className="reveal"><Heading text={COPY.faq.title} /></div>
      <div className="faq__list reveal">
        {FAQ.map(({ q, a }) => (
          <details key={q}>
            <summary>{q}<span className="faq__plus" aria-hidden="true" /></summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
