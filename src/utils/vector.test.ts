import { describe, expect, it } from 'vitest'
import { cosineSimilarity } from '@/utils/vector'

describe('cosineSimilarity', () => {
  it('даёт 1 для одинаковых векторов', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1)
  })

  it('даёт 0 для ортогональных', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0)
  })
})
