import { useEffect, useState, type RefObject } from 'react'

/** 0 when a tall sticky section's top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const span = el.offsetHeight - innerHeight
      setP(span > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span)) : 0)
    }
    const onScroll = () => { frame ||= requestAnimationFrame(measure) }
    measure()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [ref])
  return p
}
