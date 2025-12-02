import { describe, expect, test } from 'bun:test'
import { makeNumber } from './utils'

describe('makeNumber()', () => {
  test('should convert "1" to number', () => {
    const n = makeNumber('1', 0)
    expect(n).toBe(1)
  })

  test('should convert "nonsense" to a fallback value', () => {
    const n = makeNumber('nonsense', 0)
    expect(n).toBe(0)
  })

  test('should convert Infinity to a fallback value', () => {
    const n = makeNumber(Infinity, 0)
    expect(n).toBe(0)
  })
})
