import { describe, expect, it } from 'vitest'
import { normalizeText } from './normalize-text'

describe('normalizeText', () => {
  it('trims and lowercases', () => {
    expect(normalizeText('  Hello  ')).toBe('hello')
  })

  it('replaces ё with е', () => {
    expect(normalizeText('ёлка')).toBe('елка')
  })

  it('collapses whitespace', () => {
    expect(normalizeText('a   b')).toBe('a b')
  })
})
