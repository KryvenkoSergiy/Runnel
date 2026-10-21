import './ui.css'

/** The Runnel mark: three bars, one per envelope share. Colours come from the look. */
export const Mark = ({ size = 22 }: { size?: number }) => (
  <svg className="mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="4" rx="2" />
    <rect x="3" y="10" width="12" height="4" rx="2" />
    <rect x="3" y="16" width="7" height="4" rx="2" />
  </svg>
)
