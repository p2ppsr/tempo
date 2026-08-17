import type { Playlist } from '../types/interfaces'

export const LIKED_SONGS_STORAGE_KEY = 'likedSongs'
export const PLAYLISTS_STORAGE_KEY = 'playlists'

const uniqueNonEmptyStrings = (values: unknown[]): string[] => Array.from(new Set(
  values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
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

export const readLikedSongIds = (): string[] => {
  if (typeof window === 'undefined') return []
  return parseLikedSongIds(window.localStorage.getItem(LIKED_SONGS_STORAGE_KEY))
}

export const writeLikedSongIds = (songIds: string[]): string[] => {
  const normalized = uniqueNonEmptyStrings(songIds)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LIKED_SONGS_STORAGE_KEY, JSON.stringify(normalized))
  }
  return normalized
}

const isPlaylist = (value: unknown): value is Playlist => {
  if (!value || typeof value !== 'object') return false
  const playlist = value as Partial<Playlist>
  return typeof playlist.id === 'string' && typeof playlist.name === 'string' && Array.isArray(playlist.songs)
}

export const parsePlaylists = (stored: string | null): Playlist[] => {
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isPlaylist) : []
  } catch {
    return []
  }
}

export const readPlaylists = (): Playlist[] => {
  if (typeof window === 'undefined') return []
  return parsePlaylists(window.localStorage.getItem(PLAYLISTS_STORAGE_KEY))
}

export const writePlaylists = (playlists: Playlist[]): Playlist[] => {
  const normalized = playlists.filter(isPlaylist)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(normalized))
  }
  return normalized
}
