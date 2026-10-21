import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Currencies } from '../sections/Currencies'
import { Faq } from '../sections/Faq'
import { Footer } from '../sections/Footer'
import { Pricing } from '../sections/Pricing'
import { Rules } from '../sections/Rules'
import { Waitlist } from '../sections/Waitlist'
import '../sections/sections.css'
import { StoreProvider } from '../state/store'
import { LOOKS, lookMeta, preloadLook } from '../themes/registry'
import type { LookId, ThemeModule } from '../themes/types'
import { reducedMotion } from '../ui/motion'
import { BuiltNotes, findNoteTargets, type NoteTargets } from './BuiltNotes'
import { Nav } from './Nav'

interface Current { id: LookId; mod: ThemeModule }

// Section heights differ per look, so a switch keeps the reader in the same section at the same relative depth.
const NAV = 80
const sections = () => [...document.querySelectorAll<HTMLElement>('main > section, body footer')]

function anchor() {
  const list = sections()
  const i = Math.max(0, list.findLastIndex((el) => el.getBoundingClientRect().top <= NAV))
  const r = list[i].getBoundingClientRect()
  return { i, f: (NAV - r.top) / r.height }
}

function restore({ i, f }: ReturnType<typeof anchor>) {
  const el = sections()[i]
  if (!el) return
  const r = el.getBoundingClientRect()
  scrollTo({ top: scrollY + r.top + f * r.height - NAV, behavior: 'instant' })
}

export function App({ initial }: { initial: Current }) {
  const [cur, setCur] = useState(initial)
  const [said, setSaid] = useState('')
  const [built, setBuilt] = useState<NoteTargets | null>(null)
  const toggleBuilt = () => setBuilt((b) => (b ? null : findNoteTargets()))
  const switching = useRef(false)

  async function pick(id: LookId, from?: Element | null) {
    if (id === cur.id || switching.current) return
    switching.current = true
    try {
      await switchTo(id, from)
    } finally {
      switching.current = false
    }
  }

  async function switchTo(id: LookId, from?: Element | null) {
    // Chunk, CSS and fonts first: the transition snapshots the new look fully styled.
    const mod = await preloadLook(id)
    const at = anchor()
    const swap = () => {
      flushSync(() => setCur({ id, mod }))
      setBuilt((b) => b && findNoteTargets())
      restore(at)
      // The circle is the new look's entrance. Its own intro animations would keep content flying in after
      // the circle closes, which reads as a blink; finish them so the circle reveals a settled page.
      for (const a of document.getAnimations()) {
        if (a.timeline === document.timeline && a.effect?.getTiming().iterations !== Infinity) a.finish()
      }
    }
    const root = document.documentElement
    if (!document.startViewTransition || reducedMotion()) {
      swap()
    } else {
      const r = from?.getBoundingClientRect()
      const x = r ? r.left + r.width / 2 : innerWidth / 2
      const y = r ? r.top + r.height / 2 : 0
      root.style.setProperty('--vt-x', `${x}px`)
      root.style.setProperty('--vt-y', `${y}px`)
      root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`)
      root.dataset.switch = ''
      await document.startViewTransition(swap).finished.catch(() => {})
      delete root.dataset.switch
    }
    const url = new URL(location.href)
    url.searchParams.set('look', id)
    history.replaceState(null, '', url)
    setSaid(`Theme: ${lookMeta(id).name}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as Element).closest('input, textarea, select, [contenteditable]')) return
      if (e.key === '?') return toggleBuilt()
      const look = LOOKS[Number(e.key) - 1]
      if (look) pick(look.id, document.querySelector(`.looks [data-look="${look.id}"]`))
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  return (
    <StoreProvider>
      <Nav look={cur.id} onPick={pick} onPreload={preloadLook} />
      <p className="sr" aria-live="polite">{said}</p>
      <Page look={cur.id} mod={cur.mod} />
      {built && <BuiltNotes look={lookMeta(cur.id)} notes={cur.mod.notes} targets={built} />}
      <button type="button" className="built-toggle" aria-pressed={!!built} aria-keyshortcuts="?" onClick={toggleBuilt}>
        How it's built <kbd>?</kbd>
      </button>
    </StoreProvider>
  )
}

function Page({ look, mod: { Hero, Month } }: { look: LookId; mod: ThemeModule }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.look = look
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', lookMeta(look).themeColor)
  }, [look])

  return (
    <>
      <main id="top">
        <Hero />
        <Rules />
        <Currencies />
        <Month />
        <Pricing />
        <Faq />
        <Waitlist />
      </main>
      <Footer />
    </>
  )
}
