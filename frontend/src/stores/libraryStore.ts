import { create } from 'zustand'
import type { Playlist, Song } from '../types/interfaces'
import {
  LIBRARY_CACHE_STORAGE_KEY,
  clearLegacyLibraryStorage,
  emptyLibraryDocument,
  likedSongIdsFromDocument,
  mergeLibraryDocuments,
  parseLibraryDocument,
  playlistsFromDocument,
  portableSong,
  readCachedLibraryDocument,
  writeCachedLibraryDocument,
  type LibraryDocument,
  type LibraryMutationStamp
} from '../utils/libraryStorage'
import { readWalletLibrary, writeWalletLibrary } from '../utils/walletLibrary'
import { captureError, captureSignal } from '../utils/usercom'
import { detectedWalletSurface } from '../utils/wallet'

export type LibrarySyncStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'offline'

interface LibraryStore {
  document: LibraryDocument
  likedSongIds: string[]
  playlists: Playlist[]
  syncStatus: LibrarySyncStatus
  syncError: string | null
  initializeLibrary: (force?: boolean) => Promise<void>
  toggleSongLike: (songId: string) => Promise<void>
  createPlaylist: (id: string, name: string, songs?: Song[]) => Promise<void>
  renamePlaylist: (id: string, name: string) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>
}

const browserStorage = (): Storage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

const initialDocument = readCachedLibraryDocument(browserStorage())
let initializationPromise: Promise<void> | null = null
let persistenceQueue: Promise<void> = Promise.resolve()
let mutationSequence = 0
let walletLibraryConnected = false

const mutationStamp = (): LibraryMutationStamp => ({
  at: Date.now(),
  id: `${mutationSequence += 1}-${Math.random().toString(36).slice(2)}`
})

const cloneDocument = (document: LibraryDocument): LibraryDocument => JSON.parse(JSON.stringify(document)) as LibraryDocument

const storeProjection = (document: LibraryDocument) => ({
  document,
  likedSongIds: likedSongIdsFromDocument(document),
  playlists: playlistsFromDocument(document)
})

const messageForError = (error: unknown): string => error instanceof Error ? error.message : String(error)

export const useLibraryStore = create<LibraryStore>((set, get) => {
  const cacheAndSet = (document: LibraryDocument, status?: LibrarySyncStatus) => {
    writeCachedLibraryDocument(document, browserStorage())
    set({ ...storeProjection(document), ...(status ? { syncStatus: status } : {}) })
  }

  const initializeLibrary = async (force = false): Promise<void> => {
    if (!force && get().syncStatus === 'ready') return
    if (initializationPromise) return initializationPromise

    if (!force && detectedWalletSurface() === 'browser') {
      set({
        syncStatus: 'offline',
        syncError: 'A wallet connection is required to sync this library across devices.'
      })
      return
    }

    initializationPromise = (async () => {
      set({ syncStatus: 'loading', syncError: null })
      captureSignal('library.sync_started', { surface: 'wallet-library' })
      try {
        const remote = await readWalletLibrary()
        const merged = mergeLibraryDocuments(remote, get().document)
        const mergedHasLibraryState = Object.keys(merged.likes).length > 0 || Object.keys(merged.playlists).length > 0
        if ((!remote && mergedHasLibraryState) || (remote && JSON.stringify(remote) !== JSON.stringify(merged))) {
          await writeWalletLibrary(merged)
        }
        clearLegacyLibraryStorage(browserStorage())
        walletLibraryConnected = true
        cacheAndSet(merged, 'ready')
        set({ syncError: null })
        captureSignal('library.sync_succeeded', {
          surface: 'wallet-library',
          context: {
            likes: likedSongIdsFromDocument(merged).length,
            playlists: playlistsFromDocument(merged).length
          }
        })
      } catch (error) {
        const message = messageForError(error)
        set({ syncStatus: 'offline', syncError: message })
        captureError('library.sync_failed', error, { surface: 'wallet-library' }, ['wallet_failed'])
      } finally {
        initializationPromise = null
      }
    })()

    return initializationPromise
  }

  const persist = async (mutation: string): Promise<void> => {
    persistenceQueue = persistenceQueue.then(async () => {
      if (!walletLibraryConnected && detectedWalletSurface() === 'browser') {
        cacheAndSet(get().document, 'offline')
        set({ syncError: 'A wallet connection is required to sync this library across devices.' })
        return
      }
      set({ syncStatus: 'saving', syncError: null })
      try {
        const remote = await readWalletLibrary()
        const merged = mergeLibraryDocuments(remote, get().document)
        await writeWalletLibrary(merged)
        clearLegacyLibraryStorage(browserStorage())
        cacheAndSet(merged, 'ready')
        set({ syncError: null })
        captureSignal('library.mutation_succeeded', { surface: 'wallet-library', context: { mutation } })
      } catch (error) {
        const message = messageForError(error)
        cacheAndSet(get().document, 'offline')
        set({ syncError: message })
        captureError('library.mutation_failed', error, { surface: 'wallet-library', mutation }, ['wallet_failed'])
      }
    })
    return persistenceQueue
  }

  const mutate = async (mutation: string, update: (document: LibraryDocument, stamp: LibraryMutationStamp) => void) => {
    const shouldInitialize = get().syncStatus === 'idle' || get().syncStatus === 'loading'
    const document = cloneDocument(get().document)
    update(document, mutationStamp())
    cacheAndSet(document, 'saving')
    if (shouldInitialize) await initializeLibrary()
    await persist(mutation)
  }

  return {
    ...storeProjection(initialDocument),
    syncStatus: 'idle',
    syncError: null,
    initializeLibrary,
    toggleSongLike: async (songId) => {
      const normalizedId = songId.trim()
      if (!normalizedId) return
      await mutate('toggle_like', (document, stamp) => {
        document.likes[normalizedId] = {
          liked: !document.likes[normalizedId]?.liked,
          stamp
        }
      })
    },
    createPlaylist: async (id, name, songs = []) => {
      const normalizedId = id.trim()
      const normalizedName = name.trim()
      if (!normalizedId || !normalizedName) return
      await mutate('create_playlist', (document, stamp) => {
        document.playlists[normalizedId] = {
          id: normalizedId,
          name: normalizedName,
          createdAt: stamp.at,
          nameStamp: stamp,
          lifecycle: 'active',
          lifecycleStamp: stamp,
          songs: Object.fromEntries(songs.map(song => [song.songURL, {
            present: true,
            song: portableSong(song),
            stamp
          }]))
        }
      })
    },
    renamePlaylist: async (id, name) => {
      const normalizedName = name.trim()
      if (!normalizedName) return
      await mutate('rename_playlist', (document, stamp) => {
        const playlist = document.playlists[id]
        if (!playlist || playlist.lifecycle === 'deleted') return
        playlist.name = normalizedName
        playlist.nameStamp = stamp
      })
    },
    deletePlaylist: async (id) => {
      await mutate('delete_playlist', (document, stamp) => {
        const playlist = document.playlists[id]
        if (!playlist) return
        playlist.lifecycle = 'deleted'
        playlist.lifecycleStamp = stamp
      })
    },
    addSongToPlaylist: async (playlistId, song) => {
      await mutate('add_song_to_playlist', (document, stamp) => {
        const playlist = document.playlists[playlistId]
        if (!playlist || playlist.lifecycle === 'deleted') return
        playlist.songs[song.songURL] = { present: true, song: portableSong(song), stamp }
      })
    },
    removeSongFromPlaylist: async (playlistId, songId) => {
      await mutate('remove_song_from_playlist', (document, stamp) => {
        const playlist = document.playlists[playlistId]
        const existing = playlist?.songs[songId]
        if (!playlist || !existing) return
        playlist.songs[songId] = { ...existing, present: false, stamp }
      })
    }
  }
})

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== LIBRARY_CACHE_STORAGE_KEY) return
    const cached = parseLibraryDocument(event.newValue) ?? emptyLibraryDocument()
    const merged = mergeLibraryDocuments(useLibraryStore.getState().document, cached)
    useLibraryStore.setState(storeProjection(merged))
  })
}
