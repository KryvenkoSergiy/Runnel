import { describe, expect, it } from 'vitest'
import { DEFAULT_LOOK, LOOKS, parseLook } from './registry'

describe('parseLook', () => {
  it('reads a known look from the query string', () => {
    expect(parseLook('?look=swiss')).toBe('swiss')
    expect(parseLook('?utm=x&look=night')).toBe('night')
  })

  it('falls back to the default for unknown or missing looks', () => {
    expect(parseLook('?look=neon')).toBe(DEFAULT_LOOK)
    expect(parseLook('')).toBe(DEFAULT_LOOK)
  })
})

describe('LOOKS', () => {
  it('has unique ids and letters', () => {
    expect(new Set(LOOKS.map((l) => l.id)).size).toBe(LOOKS.length)
    expect(new Set(LOOKS.map((l) => l.letter)).size).toBe(LOOKS.length)
  })
})
