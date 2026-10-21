import { COPY } from '../content'

export function Footer() {
  return (
    <footer className="footer">
      {COPY.footer.map((line) => <span key={line}>{line}</span>)}
    </footer>
  )
}
