import { create } from 'zustand'
import type { Playlist } from '../types/interfaces'
import {
  LIKED_SONGS_STORAGE_KEY,
  PLAYLISTS_STORAGE_KEY,
  readLikedSongIds,
  readPlaylists,
  writeLikedSongIds,
  writePlaylists
} from '../utils/libraryStorage'

interface LibraryStore {
  likedSongIds: string[]
  playlists: Playlist[]
  toggleSongLike: (songId: string) => void
  setPlaylists: (playlists: Playlist[]) => void
  refreshLikes: () => void
  refreshPlaylists: () => void
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  likedSongIds: readLikedSongIds(),
  playlists: readPlaylists(),
  toggleSongLike: (songId) => {
    if (!songId) return
    const current = get().likedSongIds
    const next = current.includes(songId) ? current.filter(id => id !== songId) : [...current, songId]
    set({ likedSongIds: writeLikedSongIds(next) })
  },
  setPlaylists: (playlists) => set({ playlists: writePlaylists(playlists) }),
  refreshLikes: () => set({ likedSongIds: readLikedSongIds() }),
  refreshPlaylists: () => set({ playlists: readPlaylists() })
}))

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === LIKED_SONGS_STORAGE_KEY) useLibraryStore.getState().refreshLikes()
    if (event.key === PLAYLISTS_STORAGE_KEY) useLibraryStore.getState().refreshPlaylists()
  })
}
