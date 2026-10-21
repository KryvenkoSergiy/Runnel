import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import type { ThemeModule } from '../types'
import './theme.css'

export { Hero } from './Hero'
export { Month } from './Month'

export const notes: ThemeModule['notes'] = {
  hero: 'Glow is filter: drop-shadow on SVG strokes. The beam and the balance flash are one-shot CSS animations; the columns keep the old balances until the flows reach them.',
  month: 'The chart is three step paths revealed with clip-path. stroke-dashoffset would drift against the days on the vertical steps.',
}
