import { useSyncExternalStore } from 'react'

const query = () => matchMedia('(prefers-reduced-motion: reduce)')
export const reducedMotion = () => query().matches

/** Live version of `reducedMotion` for render decisions. */
export function useReducedMotion() {
  return useSyncExternalStore((cb) => {
    const q = query()
    q.addEventListener('change', cb)
    return () => q.removeEventListener('change', cb)
  }, reducedMotion)
}

/**
 * Choreography pause that collapses to zero under reduced motion. With a `signal` it rejects on abort,
 * which unwinds a hero's routing chain when the look is switched away mid-animation.
 */
export const wait = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  signal?.throwIfAborted()
  const t = setTimeout(resolve, reducedMotion() ? 0 : ms)
  signal?.addEventListener('abort', () => { clearTimeout(t); reject(signal.reason) }, { once: true })
})

/** Restarts a one-shot CSS animation bound to `cls`; only for elements whose className React never changes. */
export function replay(el: Element, cls: string) {
  el.classList.remove(cls)
  void (el as HTMLElement).offsetWidth
  el.classList.add(cls)
}
