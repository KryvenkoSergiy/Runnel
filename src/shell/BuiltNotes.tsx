import { createPortal } from 'react-dom'
import { BUILT, type SectionId } from '../content'
import type { LookMeta, ThemeModule } from '../themes/types'

export type NoteTargets = [SectionId, HTMLElement][]

/**
 * Where each section's note goes. Read from the DOM right after the page commits (toggle or look switch),
 * because Hero and Month are new elements in every look. Inside Month the note goes into the sticky frame,
 * otherwise it would scroll away while the scene is pinned.
 */
export const findNoteTargets = (): NoteTargets =>
  [...document.querySelectorAll<HTMLElement>('main > section')].map((el) => [
    (el.id || 'hero') as SectionId,
    el.querySelector<HTMLElement>('.month__sticky') ?? el,
  ])

/** "How it's built": one note per section, portalled into the section so it scrolls with it. */
export function BuiltNotes({ look, notes, targets }: { look: LookMeta; notes: ThemeModule['notes']; targets: NoteTargets }) {
  return targets.map(([id, el]) => createPortal(
    <aside className="note" aria-label="How this section is built">
      <p><b>All looks</b>{BUILT[id]}</p>
      {notes[id] && <p><b>{look.letter} · {look.name}</b>{notes[id]}</p>}
    </aside>,
    el,
    id,
  ))
}
