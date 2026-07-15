import { describe, expect, it } from 'vitest'
import type { Song } from '../types/interfaces'
import { prepareSongPlayback } from './playbackSelection'

const song = (overrides: Partial<Song> = {}): Song => ({
  title: 'Paper Stacks',
  artist: 'Tempo',
  isPublished: true,
  songURL: 'XUT-song',
  artworkURL: 'XUT-art',
  description: '',
  duration: 120,
  token: { inputs: {}, mapiResponses: {}, outputScript: '', proof: {}, rawTX: '', satoshis: 0, txid: '', vout: 0 },
  ...overrides
})

describe('one-tap playback selection', () => {
  it('requests a full-track unlock for an independent release, even when a preview exists', () => {
    const prepared = prepareSongPlayback(song({ previewURL: 'XUT-preview', decryptedSongURL: 'XUT-preview' }))
    expect(prepared.autoUnlock).toBe(true)
    expect(prepared.song.decryptedSongURL).toBeUndefined()
  })

  it('plays bundled music without requesting payment', () => {
    const prepared = prepareSongPlayback(song({ isPublished: false, decryptedSongURL: '/assets/demo.mp3' }))
    expect(prepared.autoUnlock).toBe(false)
  })

  it('reuses the current unlocked object URL instead of buying the same song twice', () => {
    const prepared = prepareSongPlayback(song(), {
      songURL: 'XUT-song',
      decryptedSongURL: 'blob:https://tempomusic.net/full-track'
    })
    expect(prepared.autoUnlock).toBe(false)
    expect(prepared.song.decryptedSongURL).toContain('blob:')
  })
})

