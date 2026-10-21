import type { LookId } from '../themes/types'
import { Mark } from '../ui/Mark'
import { LookSwitcher } from './LookSwitcher'

const LINKS = [
  ['rules', 'Rules'],
  ['currencies', 'Currencies'],
  ['month', 'A month'],
  ['pricing', 'Pricing'],
  ['faq', 'FAQ'],
] as const

interface Props {
  look: LookId
  onPick: (id: LookId, from: Element) => void
  onPreload: (id: LookId) => void
}

export function Nav({ look, onPick, onPreload }: Props) {
  return (
    <header className="nav">
      <a className="nav__brand" href="#top" aria-label="Runnel home"><Mark />Runnel</a>
      <LookSwitcher look={look} onPick={onPick} onPreload={onPreload} />
      <nav className="nav__links" aria-label="Sections">
        {LINKS.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <a className="btn btn--primary nav__cta" href="#waitlist">Join waitlist</a>
    </header>
  )
}
