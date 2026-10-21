import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import './ui.css'

interface Props<T extends string> {
  label: string
  options: readonly { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  className?: string
}

export function Segmented<T extends string>({ label, options, value, onChange, className }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const active = options.findIndex((o) => o.value === value)

  useLayoutEffect(() => {
    const el = ref.current!
    const place = () => {
      const b = el.querySelectorAll('button')[active]
      if (!b) return
      el.style.setProperty('--seg-x', `${b.offsetLeft}px`)
      el.style.setProperty('--seg-w', `${b.offsetWidth}px`)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(el)
    return () => ro.disconnect()
  }, [active])

  // Enable the pill transition only after fonts settle, otherwise it slides in from 0 on load.
  useEffect(() => {
    let on = true
    document.fonts.ready.then(() => requestAnimationFrame(() => on && setReady(true)))
    return () => { on = false }
  }, [])

  return (
    <div ref={ref} role="group" aria-label={label} className={['seg', ready && 'seg--ready', className].filter(Boolean).join(' ')}>
      <span className="seg__pill" aria-hidden="true" />
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
