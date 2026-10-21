import { useEffect, useEffectEvent, useRef, useState, type RefObject } from 'react'
import { useStore, type Payment } from '../state/store'
import { useReducedMotion } from './motion'

/** A hero's signature: animate one payment from the queue into the envelopes, dispatching `route` on the way. */
type Route = (p: Payment, signal: AbortSignal) => Promise<void>

/**
 * Plays a hero by itself, forever: routes the next payment whenever the hero is idle and on screen, and
 * starts a new loop when the queue runs out. Switching the look aborts a payment mid-flight, so it stays
 * queued and the next look plays it from the start. Reduced motion leaves the hero still.
 */
export function useAutoplay(root: RefObject<HTMLElement | null>, route: Route) {
  const [s, dispatch] = useStore()
  const still = useReducedMotion()
  const [seen, setSeen] = useState(false)
  const [busy, setBusy] = useState(false)
  const abort = useRef<AbortController>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting))
    io.observe(el)
    const ctrl = new AbortController()
    abort.current = ctrl
    return () => {
      io.disconnect()
      ctrl.abort()
    }
  }, [root])

  const next = useEffectEvent(async () => {
    const p = s.queue[0]
    if (!p) return dispatch({ type: 'refillQueue' })
    const signal = abort.current!.signal
    setBusy(true)
    try {
      await route(p, signal)
    } catch (e) {
      if (signal.aborted) return // this hero is gone
      setBusy(false)
      throw e
    }
    setBusy(false)
  })

  useEffect(() => {
    if (still || !seen || busy) return
    // A beat between payments so each one reads on its own; after the last one the placeholders
    // hold for a moment before the payments drop back in.
    const t = setTimeout(next, s.queue.length ? 1600 : 1100)
    return () => clearTimeout(t)
  }, [still, seen, busy, s.queue.length])
}
