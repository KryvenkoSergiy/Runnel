import type { LookId, LookMeta, ThemeModule } from './types'

export const LOOKS: readonly LookMeta[] = [
  { id: 'paper', letter: 'A', name: 'Paper', themeColor: '#F6F6F3', fonts: ['500 1em "Geist Variable"', '400 1em "Geist Mono Variable"', 'italic 400 1em "Instrument Serif"'], load: () => import('./paper') },
  { id: 'night', letter: 'B', name: 'Night', themeColor: '#08090A', fonts: ['500 1em "Inter Tight Variable"', '400 1em "JetBrains Mono Variable"'], load: () => import('./night') },
  { id: 'swiss', letter: 'C', name: 'Swiss', themeColor: '#EDEBE6', fonts: ['800 1em "Archivo Variable"'], load: () => import('./swiss') },
  { id: 'soft', letter: 'D', name: 'Soft', themeColor: '#F2ECFF', fonts: ['650 1em "Bricolage Grotesque Variable"', '400 1em "DM Mono"'], load: () => import('./soft') },
]

export const DEFAULT_LOOK: LookId = 'paper'

const isLook = (v: string | null): v is LookId => LOOKS.some((l) => l.id === v)

export function parseLook(search: string): LookId {
  const v = new URLSearchParams(search).get('look')
  return isLook(v) ? v : DEFAULT_LOOK
}

export const lookMeta = (id: LookId): LookMeta => LOOKS.find((l) => l.id === id)!

// One promise per theme so React's `use` sees a stable value and each chunk is fetched once.
const loaded = new Map<LookId, Promise<ThemeModule>>()

function loadLook(id: LookId): Promise<ThemeModule> {
  let p = loaded.get(id)
  if (!p) {
    p = lookMeta(id).load()
    loaded.set(id, p)
    // A failed fetch (offline for a moment) must not be cached forever: the next attempt loads again.
    p.catch(() => loaded.delete(id))
  }
  return p
}

/** Chunk, CSS and first fonts of a look. Fonts get a short cap so a slow network never blocks a switch. */
export async function preloadLook(id: LookId): Promise<ThemeModule> {
  const mod = await loadLook(id)
  const fonts = Promise.all(lookMeta(id).fonts.map((f) => document.fonts.load(f))).catch(() => {})
  await Promise.race([fonts, new Promise((r) => setTimeout(r, 800))])
  return mod
}
