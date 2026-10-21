import type { CSSProperties, ReactNode } from 'react'
import type { Envelope } from '../../domain/money'

// Two wave periods per half of the 200%-wide SVG, so sliding it by -50% loops seamlessly.
const WAVE = 'M0 6 Q12.5 0 25 6 T50 6 T75 6 T100 6 T125 6 T150 6 T175 6 T200 6 V12 H0Z'

/** A glass jar whose liquid sits at `level` (0..1); `brim` fills it to the top for a beat. */
export function Jar({ k, level, brim, children }: { k: Envelope; level: number; brim?: boolean; children?: ReactNode }) {
  return (
    <div className="jar" data-k={k} data-brim={brim || undefined} style={{ '--lvl': `${(level * 100).toFixed(1)}%` } as CSSProperties}>
      {children}
      <div className="jar__liq">
        <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d={WAVE} /></svg>
      </div>
    </div>
  )
}
