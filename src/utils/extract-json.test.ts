import { describe, expect, it } from 'vitest'
import { extractJsonObject } from '../../server/extract-json'

describe('extractJsonObject', () => {
  it('парсит чистый объект', () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 })
  })

  it('достаёт из markdown fence', () => {
    expect(extractJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true })
  })
})
