import { describe, expect, it } from 'vitest'
import { buildAssetReceipt, earliestAssetExpiry, expiryFromRetention } from './publicationReceipt'

describe('publication asset verification', () => {
  it('requires two independently active providers and records the earliest expiry', () => {
    const receipt = buildAssetReceipt('uhrp:test', [
      { host: 'https://one.example', expiryTime: 5_000 },
      { host: 'https://two.example', expiryTime: 4_000 }
    ], 1_000)

    expect(receipt.available).toBe(true)
    expect(receipt.hostedBy).toHaveLength(2)
    expect(receipt.expiryTime).toBe(4_000)
  })

  it('fails closed when a copy is expired or cannot be inspected', () => {
    const receipt = buildAssetReceipt('uhrp:test', [
      { host: 'https://one.example', expiryTime: 999 },
      null,
      { host: 'https://three.example', expiryTime: 5_000 }
    ], 1_000)

    expect(receipt.available).toBe(false)
    expect(receipt.hostedBy).toEqual(['https://three.example'])
  })

  it('records the paid retention window in seconds', () => {
    expect(expiryFromRetention(60, 1_000)).toBe(4_600)
    expect(expiryFromRetention(0, 1_000)).toBeUndefined()
  })

  it('formats receipts safely when expiry metadata is absent', () => {
    expect(earliestAssetExpiry([
      undefined,
      { uhrpURL: 'uhrp:one', expiryTime: 5_000, hostedBy: [], available: true },
      { uhrpURL: 'uhrp:two', expiryTime: 4_000, hostedBy: [], available: true }
    ])).toBe(4_000)
    expect(earliestAssetExpiry([undefined])).toBeUndefined()
  })
})
