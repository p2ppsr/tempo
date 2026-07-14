import { describe, expect, it } from 'vitest'
import { StorageUtils } from '@bsv/sdk'
import { isBundledAsset, normalizeUhrpReference } from './catalogAvailability'

describe('catalogue availability references', () => {
  it('normalizes current and legacy UHRP references', () => {
    const reference = StorageUtils.getURLForFile([1, 2, 3, 4])
    expect(normalizeUhrpReference(reference)).toBe(reference)
    expect(normalizeUhrpReference(`uhrp://${reference}`)).toBe(reference)
    expect(normalizeUhrpReference(`https://uhrp.babbage.systems/${reference}`)).toBe(reference)
  })

  it('rejects malformed catalogue URLs', () => {
    expect(normalizeUhrpReference('https://example.com/not-a-uhrp-file')).toBeUndefined()
    expect(normalizeUhrpReference('')).toBeUndefined()
  })

  it('recognizes bundled previews without a wallet or network lookup', () => {
    expect(isBundledAsset('/assets/preview.mp3')).toBe(true)
    expect(isBundledAsset('/src/assets/preview.mp3')).toBe(true)
    expect(isBundledAsset('https://other.example/assets/preview.mp3')).toBe(false)
  })
})
