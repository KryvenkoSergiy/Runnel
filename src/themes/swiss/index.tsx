import '@fontsource-variable/archivo/wdth.css'
import type { ThemeModule } from '../types'
import './theme.css'

export { Hero } from './Hero'
export { Month } from './Month'

export const notes: ThemeModule['notes'] = {
  hero: 'Curtains are scaleX with transform-origin swapped from left to right, so filling and wiping are one transition run both ways. Archivo\'s width axis gives font-stretch: 125%.',
  month: 'The poster number is a RollingNumber at 36svh; the bars animate background-size, which never triggers layout.',
}
