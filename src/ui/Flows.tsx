import { useImperativeHandle, useLayoutEffect, useRef, type Ref, type RefObject } from 'react'
import { ENVELOPES, sumParts, type Parts } from '../domain/money'
import { reducedMotion } from './motion'
import './ui.css'

export interface FlowsHandle { run: (parts: Parts) => void }

/**
 * Curves from the top centre of the SVG down to the centre of each child of `targets`,
 * measured from the real layout so they follow whatever grid a look uses.
 */
export function Flows({ ref, targets, className }: { ref?: Ref<FlowsHandle>; targets: RefObject<HTMLElement | null>; className?: string }) {
  const svg = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const s = svg.current!
    const layout = () => {
      const r = s.getBoundingClientRect()
      const kids = targets.current ? [...targets.current.children] : []
      s.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`)
      const x0 = r.width / 2
      const paths = s.querySelectorAll('path')
      kids.slice(0, ENVELOPES.length).forEach((kid, i) => {
        const b = kid.getBoundingClientRect()
        const x = b.left + b.width / 2 - r.left
        const d = `M${x0} 0 C${x0} ${r.height * 0.6}, ${x} ${r.height * 0.4}, ${x} ${r.height}`
        paths[i].setAttribute('d', d)
        paths[i + ENVELOPES.length].setAttribute('d', d)
      })
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(s)
    if (targets.current) ro.observe(targets.current)
    document.fonts.ready.then(layout)
    return () => ro.disconnect()
  }, [targets])

  useImperativeHandle(ref, () => ({
    run(parts) {
      if (reducedMotion()) return
      const total = sumParts(parts) || 1
      svg.current!.querySelectorAll<SVGPathElement>('.flows__run').forEach((p, i) => {
        p.classList.remove('flows__run--go')
        void p.getBoundingClientRect()
        // Thickness reads as share, so a 60% envelope gets a visibly fatter stream.
        p.style.setProperty('--flow-w', (parts[ENVELOPES[i]] / total).toFixed(3))
        p.style.animationDelay = `${i * 70}ms`
        p.classList.add('flows__run--go')
      })
    },
  }), [])

  return (
    <svg ref={svg} className={className ? `flows ${className}` : 'flows'} aria-hidden="true">
      {ENVELOPES.map((k) => <path key={k} className="flows__base" data-k={k} />)}
      {ENVELOPES.map((k) => <path key={k} className="flows__run" data-k={k} pathLength={1} />)}
    </svg>
  )
}
