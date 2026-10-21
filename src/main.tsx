import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import { App } from './shell/App'
import { parseLook, preloadLook } from './themes/registry'

// After a redeploy an open tab may ask for chunks that no longer exist; reload once to get the new build.
addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('reloaded')) return
  sessionStorage.setItem('reloaded', '1')
  location.reload()
})

// The first look (chunk, CSS and fonts, capped) loads before the first render: without its CSS the page
// would flash unstyled anyway, and rendering after the fonts avoids a layout shift when they swap in.
const id = parseLook(location.search)
preloadLook(id).then((mod) => {
  sessionStorage.removeItem('reloaded')
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App initial={{ id, mod }} />
    </StrictMode>,
  )
})
