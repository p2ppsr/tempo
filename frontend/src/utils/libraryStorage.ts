import type { Playlist, Song } from '../types/interfaces'

export const LIKED_SONGS_STORAGE_KEY = 'likedSongs'
export const PLAYLISTS_STORAGE_KEY = 'playlists'
export const LIBRARY_CACHE_STORAGE_KEY = 'tempo:wallet-library-cache:v1'
export const LIBRARY_DOCUMENT_VERSION = 1

export interface LibraryMutationStamp {
  at: number
  id: string
}

export interface LibraryLikeRecord {
  liked: boolean
  stamp: LibraryMutationStamp
}

export interface LibraryPlaylistSongRecord {
  present: boolean
  song: Song
  stamp: LibraryMutationStamp
}

export interface LibraryPlaylistRecord {
  id: string
  name: string
  createdAt: number
  nameStamp: LibraryMutationStamp
  lifecycle: 'active' | 'deleted'
  lifecycleStamp: LibraryMutationStamp
  songs: Record<string, LibraryPlaylistSongRecord>
}

export interface LibraryDocument {
  version: 1
  likes: Record<string, LibraryLikeRecord>
  playlists: Record<string, LibraryPlaylistRecord>
}

const LEGACY_STAMP: LibraryMutationStamp = { at: 0, id: 'legacy-browser-storage' }

export const emptyLibraryDocument = (): LibraryDocument => ({
  version: LIBRARY_DOCUMENT_VERSION,
  likes: {},
  playlists: {}
})

const uniqueNonEmptyStrings = (values: unknown[]): string[] => Array.from(new Set(
  values
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean)
))

export const parseLikedSongIds = (stored: string | null): string[] => {
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    if (Array.isArray(parsed)) return uniqueNonEmptyStrings(parsed)
  } catch {
    // Older Tempo releases stored likes as a comma-delimited string.
  }
  return uniqueNonEmptyStrings(stored.split(','))
}

const isSong = (value: unknown): value is Song => {
  if (!value || typeof value !== 'object') return false
  const song = value as Partial<Song>
  return typeof song.songURL === 'string' && song.songURL.trim().length > 0 &&
    typeof song.title === 'string' && typeof song.artist === 'string'
}

const isPlaylist = (value: unknown): value is Playlist => {
  if (!value || typeof value !== 'object') return false
  const playlist = value as Partial<Playlist>
  return typeof playlist.id === 'string' && playlist.id.trim().length > 0 &&
    typeof playlist.name === 'string' && playlist.name.trim().length > 0 &&
    Array.isArray(playlist.songs)
}

export const parsePlaylists = (stored: string | null): Playlist[] => {
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPlaylist).map(playlist => ({
      ...playlist,
      id: playlist.id.trim(),
      name: playlist.name.trim(),
      songs: playlist.songs.filter(isSong)
    }))
  } catch {
    return []
  }
}

const isStamp = (value: unknown): value is LibraryMutationStamp => {
  if (!value || typeof value !== 'object') return false
  const stamp = value as Partial<LibraryMutationStamp>
  return typeof stamp.at === 'number' && Number.isFinite(stamp.at) && typeof stamp.id === 'string'
}

const isLikeRecord = (value: unknown): value is LibraryLikeRecord => {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<LibraryLikeRecord>
  return typeof record.liked === 'boolean' && isStamp(record.stamp)
}

const isPlaylistSongRecord = (value: unknown): value is LibraryPlaylistSongRecord => {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<LibraryPlaylistSongRecord>
  return typeof record.present === 'boolean' && isSong(record.song) && isStamp(record.stamp)
}

const parsePlaylistRecord = (value: unknown): LibraryPlaylistRecord | null => {
  if (!value || typeof value !== 'object') return null
  const record = value as Partial<LibraryPlaylistRecord>
  if (typeof record.id !== 'string' || !record.id.trim() || typeof record.name !== 'string' ||
      typeof record.createdAt !== 'number' || !Number.isFinite(record.createdAt) ||
      (record.lifecycle !== 'active' && record.lifecycle !== 'deleted') ||
      !isStamp(record.nameStamp) || !isStamp(record.lifecycleStamp) ||
      !record.songs || typeof record.songs !== 'object') return null

  const songs: Record<string, LibraryPlaylistSongRecord> = {}
  for (const [songId, songRecord] of Object.entries(record.songs)) {
    if (songId.trim() && isPlaylistSongRecord(songRecord)) songs[songId] = songRecord
  }

  return {
    id: record.id.trim(),
    name: record.name.trim(),
    createdAt: record.createdAt,
    nameStamp: record.nameStamp,
    lifecycle: record.lifecycle,
    lifecycleStamp: record.lifecycleStamp,
    songs
  }
}

export const parseLibraryDocument = (stored: string | null | undefined): LibraryDocument | null => {
  if (!stored) return null
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Partial<LibraryDocument>
    if (candidate.version !== LIBRARY_DOCUMENT_VERSION || !candidate.likes || !candidate.playlists ||
        typeof candidate.likes !== 'object' || typeof candidate.playlists !== 'object') return null

    const likes: Record<string, LibraryLikeRecord> = {}
    for (const [songId, record] of Object.entries(candidate.likes)) {
      if (songId.trim() && isLikeRecord(record)) likes[songId] = record
    }

    const playlists: Record<string, LibraryPlaylistRecord> = {}
    for (const record of Object.values(candidate.playlists)) {
      const playlist = parsePlaylistRecord(record)
      if (playlist) playlists[playlist.id] = playlist
    }

    return { version: LIBRARY_DOCUMENT_VERSION, likes, playlists }
  } catch {
    return null
  }
}

const compareStamps = (left: LibraryMutationStamp, right: LibraryMutationStamp): number => {
  if (left.at !== right.at) return left.at - right.at
  return left.id.localeCompare(right.id)
}

const newest = <T extends { stamp: LibraryMutationStamp }>(left: T | undefined, right: T | undefined): T | undefined => {
  if (!left) return right
  if (!right) return left
  return compareStamps(left.stamp, right.stamp) >= 0 ? left : right
}

export const mergeLibraryDocuments = (...documents: Array<LibraryDocument | null | undefined>): LibraryDocument => {
  const merged = emptyLibraryDocument()

  for (const document of documents) {
    if (!document) continue
    for (const [songId, record] of Object.entries(document.likes)) {
      merged.likes[songId] = newest(merged.likes[songId], record) ?? record
    }

    for (const [playlistId, incoming] of Object.entries(document.playlists)) {
      const current = merged.playlists[playlistId]
      if (!current) {
        merged.playlists[playlistId] = { ...incoming, songs: { ...incoming.songs } }
        continue
      }

      const nameSource = compareStamps(current.nameStamp, incoming.nameStamp) >= 0 ? current : incoming
      const lifecycleSource = compareStamps(current.lifecycleStamp, incoming.lifecycleStamp) >= 0 ? current : incoming
      const songs: Record<string, LibraryPlaylistSongRecord> = {}
      for (const songId of new Set([...Object.keys(current.songs), ...Object.keys(incoming.songs)])) {
        const record = newest(current.songs[songId], incoming.songs[songId])
        if (record) songs[songId] = record
      }

      merged.playlists[playlistId] = {
        id: playlistId,
        name: nameSource.name,
        createdAt: Math.min(current.createdAt, incoming.createdAt),
        nameStamp: nameSource.nameStamp,
        lifecycle: lifecycleSource.lifecycle,
        lifecycleStamp: lifecycleSource.lifecycleStamp,
        songs
      }
    }
  }

  return merged
}

const cloneSongForStorage = (song: Song): Song => {
  const portable = { ...song }
  delete portable.selectedMusic
  delete portable.selectedArtwork
  delete portable.selectedPreview
  delete portable.decryptedSongURL
  return JSON.parse(JSON.stringify(portable)) as Song
}

export const documentFromLegacyStorage = (storage?: Storage): LibraryDocument => {
  const document = emptyLibraryDocument()
  if (!storage) return document

  for (const songId of parseLikedSongIds(storage.getItem(LIKED_SONGS_STORAGE_KEY))) {
    document.likes[songId] = { liked: true, stamp: LEGACY_STAMP }
  }

  for (const playlist of parsePlaylists(storage.getItem(PLAYLISTS_STORAGE_KEY))) {
    const songs: Record<string, LibraryPlaylistSongRecord> = {}
    for (const song of playlist.songs) {
      songs[song.songURL] = { present: true, song: cloneSongForStorage(song), stamp: LEGACY_STAMP }
    }
    document.playlists[playlist.id] = {
      id: playlist.id,
      name: playlist.name,
      createdAt: 0,
      nameStamp: LEGACY_STAMP,
      lifecycle: 'active',
      lifecycleStamp: LEGACY_STAMP,
      songs
    }
  }
  return document
}

export const readCachedLibraryDocument = (storage?: Storage): LibraryDocument => {
  if (!storage) return emptyLibraryDocument()
  return mergeLibraryDocuments(
    parseLibraryDocument(storage.getItem(LIBRARY_CACHE_STORAGE_KEY)),
    documentFromLegacyStorage(storage)
  )
}

export const writeCachedLibraryDocument = (document: LibraryDocument, storage?: Storage): void => {
  storage?.setItem(LIBRARY_CACHE_STORAGE_KEY, JSON.stringify(document))
}

export const clearLegacyLibraryStorage = (storage?: Storage): void => {
  storage?.removeItem(LIKED_SONGS_STORAGE_KEY)
  storage?.removeItem(PLAYLISTS_STORAGE_KEY)
}

export const playlistsFromDocument = (document: LibraryDocument): Playlist[] => Object.values(document.playlists)
  .filter(record => record.lifecycle === 'active' && record.name.trim().length > 0)
  .sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id))
  .map(record => ({
    id: record.id,
    name: record.name,
    songs: Object.values(record.songs)
      .filter(song => song.present)
      .sort((left, right) => compareStamps(left.stamp, right.stamp))
      .map(song => song.song)
  }))

export const likedSongIdsFromDocument = (document: LibraryDocument): string[] => Object.entries(document.likes)
  .filter(([, record]) => record.liked)
  .sort(([, left], [, right]) => compareStamps(left.stamp, right.stamp))
  .map(([songId]) => songId)

export const portableSong = cloneSongForStorage
