import { useRef, useState, type FormEvent } from 'react'
import { COPY } from '../content'
import { reducedMotion } from '../ui/motion'
import { Heading } from './Heading'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Waitlist() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const input = useRef<HTMLInputElement>(null)

  function submit(e: FormEvent) {
    e.preventDefault() // demo: nothing leaves the page
    if (!EMAIL.test(email.trim())) {
      setError(COPY.waitlist.error)
      input.current?.focus()
      if (!reducedMotion()) {
        form.current?.animate({ translate: ['0', '-8px', '6px', '-4px', '2px', '0'] }, { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' })
      }
      return
    }
    setDone(true)
  }

  return (
    <section className="block waitlist" id="waitlist">
      <div className="waitlist__card card reveal">
        <p className="label">{COPY.waitlist.label}</p>
        <Heading text={COPY.waitlist.title} />
        <p className="sub">{COPY.waitlist.sub}</p>
        {done ? (
          <div className="waitlist__success" role="status">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="28" cy="28" r="26" pathLength={1} />
              <path d="M18 29l7 7 13-15" pathLength={1} />
            </svg>
            <p>{COPY.waitlist.success}</p>
          </div>
        ) : (
          <form ref={form} className="waitlist__form" noValidate onSubmit={submit}>
            <div className="waitlist__field">
              <label className="sr" htmlFor="wl-email">Email</label>
              <input
                ref={input} id="wl-email" type="email" placeholder="you@studio.com" autoComplete="email"
                value={email} aria-invalid={!!error || undefined} aria-describedby="wl-error"
                onChange={(e) => { setEmail(e.target.value); setError('') }}
              />
              <button className="btn btn--primary" type="submit">Join</button>
            </div>
            <p className="waitlist__error" id="wl-error" aria-live="assertive">{error}</p>
          </form>
        )}
        <p className="fine">{COPY.waitlist.fine}</p>
      </div>
    </section>
  )
}
