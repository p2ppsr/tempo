import { describe, expect, it } from 'vitest'
import { sanitizeUsercomContext } from './usercom'

describe('UserCom context sanitization', () => {
  it('keeps safe catalogue reason aggregates inspectable', () => {
    expect(sanitizeUsercomContext({
      excluded: { key_not_available: 2, audio_not_hosted: 1 }
    })).toEqual({
      excluded: { key_not_available: 2, audio_not_hosted: 1 }
    })
  })

  it('redacts wallet and transaction-bearing fields recursively', () => {
    expect(sanitizeUsercomContext({
      artistIdentityKey: 'public-value',
      nested: { transaction: 'raw-transaction', password: 'nope' }
    })).toEqual({
      artistIdentityKey: '[redacted]',
      nested: { transaction: '[redacted]', password: '[redacted]' }
    })
  })
})
