import { describe, expect, it } from 'vitest'
import { parseLikedSongIds, parsePlaylists } from './libraryStorage'

describe('library storage', () => {
  it('treats missing and empty like state as no likes', () => {
    expect(parseLikedSongIds(null)).toEqual([])
    expect(parseLikedSongIds('')).toEqual([])
  })

  it('migrates legacy likes and removes empty duplicates', () => {
    expect(parseLikedSongIds('song-a,,song-b,song-a')).toEqual(['song-a', 'song-b'])
  })

  it('reads canonical JSON likes', () => {
    expect(parseLikedSongIds('["song-a","song-b"]')).toEqual(['song-a', 'song-b'])
  })

  it('fails closed for malformed playlists', () => {
    expect(parsePlaylists('{not-json')).toEqual([])
    expect(parsePlaylists('[{"name":"missing id","songs":[]}]')).toEqual([])
  })
})
