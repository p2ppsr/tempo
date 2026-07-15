import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('paid playback reliability contract', () => {
  it('verifies storage before paying and keeps retries inside one SDK payment context', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/utils/decryptSong.ts'), 'utf8')
    expect(source.indexOf('downloadStorageObject(song.songURL)')).toBeLessThan(source.indexOf('authFetch.fetch'))
    expect(source).toContain('paymentRetryAttempts: 3')
    expect(source).not.toContain('Promise.all([')
  })

  it('routes explicit song selection through the one-tap unlock request', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/SongList/SongList.tsx'), 'utf8')
    expect(source).toContain('requestAutoUnlock(prepared.song)')
    expect(source).toContain('Buy &amp; play')
  })

  it('unions repeated overlay discovery results before filtering the catalogue', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/utils/fetchSongs/fetchSongs.ts'), 'utf8')
    expect(source).toContain('CATALOG_LOOKUP_ATTEMPTS = 3')
    expect(source).toContain('outputsByOutpoint.set')
    expect(source).toContain('const resolver = new LookupResolver')
    expect(source).toContain('uniqueOutputs: outputsByOutpoint.size')
  })

  it('queries independent primary overlays before excluding and retries verified downloads', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/utils/catalogAvailability.ts'), 'utf8')
    expect(source).toContain('resolveStorageLocations')
    expect(source).toContain('Math.min(2, songs.length)')
    const storageSource = readFileSync(resolve(process.cwd(), 'src/utils/storageReliability.ts'), 'utf8')
    expect(storageSource).toContain('const STORAGE_ATTEMPTS = 3')
    expect(storageSource).toContain('hostOverrides: { ls_uhrp: constants.uhrpLookupHosts }')
    expect(storageSource).toContain('for await (const response of resolver.query$(')
    expect(storageSource).toContain('actualHash !== expectedHash')
  })

  it('resolves catalogue artwork through the same primary storage overlays', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/ArtworkImage/ArtworkImage.tsx'), 'utf8')
    expect(source).toContain('resolveStorageLocations(normalizedSrc)')
    expect(source).not.toContain("from '@bsv/uhrp-react'")
  })
})
