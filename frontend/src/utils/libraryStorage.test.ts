import { describe, expect, it } from 'vitest'
import type { Song } from '../types/interfaces'
import {
  documentFromLegacyStorage,
  emptyLibraryDocument,
  likedSongIdsFromDocument,
  mergeLibraryDocuments,
  parseLibraryDocument,
  parseLikedSongIds,
  parsePlaylists,
  playlistsFromDocument,
  type LibraryDocument,
  type LibraryMutationStamp
} from './libraryStorage'

const song = {
  title: 'Dawnvisions', artist: 'Dooblr', songURL: 'song-a', artworkURL: '',
  isPublished: false, description: '', duration: 15, token: {}
} as Song

const stamp = (at: number, id = `device-${at}`): LibraryMutationStamp => ({ at, id })

const playlistDocument = (overrides: Partial<LibraryDocument['playlists'][string]> = {}): LibraryDocument => ({
  ...emptyLibraryDocument(),
  playlists: {
    'playlist-1': {
      id: 'playlist-1',
      name: 'Road trip',
      createdAt: 1,
      nameStamp: stamp(1),
      lifecycle: 'active',
      lifecycleStamp: stamp(1),
      songs: {},
      ...overrides
    }
  }
})

describe('library storage', () => {
  it('treats missing state as empty and migrates comma-delimited likes', () => {
    expect(parseLikedSongIds(null)).toEqual([])
    expect(parseLikedSongIds('song-a,,song-b,song-a')).toEqual(['song-a', 'song-b'])
  })

  it('rejects malformed and unnamed legacy playlists', () => {
    expect(parsePlaylists('{not-json')).toEqual([])
    expect(parsePlaylists('[{"id":"playlist-1","name":"","songs":[]}]')).toEqual([])
    expect(parsePlaylists('[{"name":"missing id","songs":[]}]')).toEqual([])
  })

  it('imports legacy browser state at low-precedence stamps', () => {
    const values = new Map([
      ['likedSongs', '["song-a"]'],
      ['playlists', JSON.stringify([{ id: 'playlist-1', name: 'Road trip', songs: [song] }])]
    ])
    const storage = { getItem: (key: string) => values.get(key) ?? null } as Storage
    const migrated = documentFromLegacyStorage(storage)

    expect(likedSongIdsFromDocument(migrated)).toEqual(['song-a'])
    expect(playlistsFromDocument(migrated)).toEqual([{ id: 'playlist-1', name: 'Road trip', songs: [song] }])
    expect(migrated.playlists['playlist-1'].nameStamp.at).toBe(0)
  })

  it('merges independent device edits without dropping either playlist', () => {
    const desktop = playlistDocument()
    const mobile = playlistDocument({ id: 'playlist-2', name: 'Gym', createdAt: 2 })
    mobile.playlists = { 'playlist-2': mobile.playlists['playlist-1'] }
    delete mobile.playlists['playlist-1']

    expect(playlistsFromDocument(mergeLibraryDocuments(desktop, mobile)).map(item => item.name)).toEqual(['Road trip', 'Gym'])
  })

  it('keeps newer delete and unlike tombstones over stale cached state', () => {
    const stale = playlistDocument({ songs: { 'song-a': { present: true, song, stamp: stamp(2) } } })
    stale.likes['song-a'] = { liked: true, stamp: stamp(2) }
    const remote = playlistDocument({ lifecycle: 'deleted', lifecycleStamp: stamp(4) })
    remote.likes['song-a'] = { liked: false, stamp: stamp(4) }

    const merged = mergeLibraryDocuments(stale, remote)
    expect(playlistsFromDocument(merged)).toEqual([])
    expect(likedSongIdsFromDocument(merged)).toEqual([])
  })

  it('fails closed when a wallet document is malformed or from another version', () => {
    expect(parseLibraryDocument('{not-json')).toBeNull()
    expect(parseLibraryDocument('{"version":2,"likes":{},"playlists":{}}')).toBeNull()
  })
})
