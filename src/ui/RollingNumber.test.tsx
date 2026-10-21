import { renderToString } from 'react-dom/server'
import { expect, it } from 'vitest'
import { RollingNumber } from './RollingNumber'

it('exposes the plain value to screen readers and hides the digit columns', () => {
  const html = renderToString(<RollingNumber value="$2,400.00" />)
  expect(html).toContain('<span class="sr">$2,400.00</span>')
  expect(html).toContain('aria-hidden="true"')
})
