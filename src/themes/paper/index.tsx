import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import type { ThemeModule } from '../types'
import './theme.css'

export { Hero } from './Hero'
export { Month } from './Month'

export const notes: ThemeModule['notes'] = {
  hero: 'The chip glides into the slot with a FLIP animation (transform and clip-path only), so nothing reflows or stretches. Flows are SVG paths drawn with stroke-dashoffset; each envelope "breathes" by restarting a one-shot CSS animation.',
  month: 'Calendar dots and tube heights are plain CSS driven by the scrolled day; the note re-enters because its key is the latest payment.',
}
