import { LOOKS } from '../themes/registry'
import type { LookId } from '../themes/types'

interface Props {
  look: LookId
  onPick: (id: LookId, from: Element) => void
  onPreload: (id: LookId) => void
}

export function LookSwitcher({ look, onPick, onPreload }: Props) {
  return (
    <div className="looks" role="group" aria-label={`Design (keys 1–${LOOKS.length})`}>
      {LOOKS.map((l) => (
        <button
          key={l.id} type="button" data-look={l.id} aria-pressed={l.id === look} aria-keyshortcuts={String(LOOKS.indexOf(l) + 1)}
          onClick={(e) => onPick(l.id, e.currentTarget)}
          onPointerEnter={() => onPreload(l.id)} onFocus={() => onPreload(l.id)}
        >
          {l.letter}<span className="looks__name"> · {l.name}</span>
        </button>
      ))}
    </div>
  )
}
