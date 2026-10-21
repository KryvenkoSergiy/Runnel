import { useLayoutEffect, useRef } from 'react'
import './ui.css'

const DIGITS = '0123456789'.split('').map((d) => `<span>${d}</span>`).join('')
const shape = (s: string) => s.replace(/\d/g, '0')
// Values are formatted amounts today, but the columns are built as HTML, so never trust the separators.
const escape = (ch: string) => ch.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/**
 * Each digit is a column of 0–9 shifted with a CSS transform, so a change is one transition per digit
 * rather than a rAF loop. Screen readers get the plain value. `instant` is for values the hand drives
 * directly (a slider): rolling there lags behind and spins through digits.
 */
export function RollingNumber({ value, className, instant }: { value: string; className?: string; instant?: boolean }) {
  const digits = useRef<HTMLSpanElement>(null)
  const prev = useRef('')

  useLayoutEffect(() => {
    const el = digits.current!
    const old = prev.current
    if (value === old) return
    if (shape(value) !== shape(old)) {
      // Rebuild columns seeded with the old digits aligned from the right, so length changes still roll.
      // The first render seeds with its own digits and therefore does not animate.
      const seed = (old || value).replace(/\D/g, '')
      let k = seed.length - 1
      let html = ''
      for (let i = value.length - 1; i >= 0; i--) {
        const ch = value[i]
        html = (/\d/.test(ch)
          ? `<span class="rw"><span class="rc" style="transform:translateY(${-(k >= 0 ? +seed[k--] : 0) * 10}%)">${DIGITS}</span></span>`
          : `<span class="rs">${escape(ch)}</span>`) + html
      }
      el.innerHTML = html
      void el.offsetWidth
    }
    const cols = el.querySelectorAll<HTMLElement>('.rc')
    const ds = value.replace(/\D/g, '')
    cols.forEach((c, i) => {
      c.style.transition = instant ? 'none' : ''
      c.style.transitionDelay = `${(cols.length - 1 - i) * 25}ms`
      c.style.transform = `translateY(${-ds[i] * 10}%)`
    })
    prev.current = value
  }, [value, instant])

  return (
    <span className={className ? `roll ${className}` : 'roll'}>
      <span className="sr">{value}</span>
      <span className="rd" aria-hidden="true" ref={digits} />
    </span>
  )
}
