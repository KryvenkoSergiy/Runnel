import type { ComponentType } from 'react'
import type { SectionId } from '../content'

export type LookId = 'paper' | 'night' | 'swiss' | 'soft'

/** What a theme chunk exports. Shared sections are restyled by the theme's CSS instead. */
export interface ThemeModule {
  Hero: ComponentType
  Month: ComponentType
  /** This look's own "How it's built" notes, shown under the shared ones. */
  notes: Partial<Record<SectionId, string>>
}

export interface LookMeta {
  id: LookId
  letter: string
  name: string
  themeColor: string
  /** CSS font shorthands the look renders first; preloaded so a switch never snapshots fallback fonts. */
  fonts: readonly string[]
  load: () => Promise<ThemeModule>
}
