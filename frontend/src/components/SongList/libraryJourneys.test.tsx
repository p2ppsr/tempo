import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const walletState = vi.hoisted(() => ({ document: null as unknown, surface: 'window-wallet' }))

vi.mock('../../utils/walletLibrary', () => ({
  readWalletLibrary: vi.fn(async () => walletState.document),
  writeWalletLibrary: vi.fn(async (document: unknown) => { walletState.document = JSON.parse(JSON.stringify(document)) })
}))

vi.mock('../../utils/wallet', () => ({
  detectedWalletSurface: () => walletState.surface
}))

vi.hoisted(() => {
  const values = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      get length() { return values.size },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => Array.from(values.keys())[index] ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, String(value))
    }
  })
})

import type { Song } from '../../types/interfaces'
import { useLibraryStore } from '../../stores/libraryStore'
import { emptyLibraryDocument, likedSongIdsFromDocument, playlistsFromDocument, type LibraryDocument } from '../../utils/libraryStorage'
import ActionsDropdown from './ActionsDropdown'
import SongList from './SongList'
import Playlists from '../../pages/Playlists/Playlists'
import ViewPlaylist from '../../pages/Playlists/ViewPlaylist'

const song = {
  title: 'Dawnvisions',
  artist: 'Dooblr',
  songURL: 'tempo-song-1',
  artworkURL: '',
  isPublished: false,
  description: '',
  duration: 15,
  token: {}
} as Song

const setDocument = (document: LibraryDocument, status: 'idle' | 'ready' = 'idle') => {
  useLibraryStore.setState({
    document,
    likedSongIds: likedSongIdsFromDocument(document),
    playlists: playlistsFromDocument(document),
    syncStatus: status,
    syncError: null
  })
}

describe('wallet library journeys', () => {
  beforeEach(() => {
    localStorage.clear()
    window.scrollTo = vi.fn()
    walletState.document = null
    walletState.surface = 'window-wallet'
    setDocument(emptyLibraryDocument())
  })

  afterEach(cleanup)

  it('shows Like until the listener explicitly likes the song', async () => {
    render(<MemoryRouter><ActionsDropdown
      info={{ row: { id: 'row-1', original: song } }}
      openAddToPlaylistModal={vi.fn()}
      openConfirmDeleteModal={vi.fn()}
    /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Like' }))

    expect(await screen.findByRole('menuitem', { name: 'Unlike' })).toBeInTheDocument()
    expect(useLibraryStore.getState().likedSongIds).toEqual(['tempo-song-1'])
    expect(localStorage.getItem('likedSongs')).toBeNull()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Unlike' }))
    expect(await screen.findByRole('menuitem', { name: 'Like' })).toBeInTheDocument()
    expect(useLibraryStore.getState().likedSongIds).toEqual([])
  })

  it('falls back immediately to the cache in an ordinary browser', async () => {
    walletState.surface = 'browser'
    render(<MemoryRouter><Playlists /></MemoryRouter>)

    expect(await screen.findByText('Saved on this device. Open Tempo with your wallet to sync everywhere.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry sync' })).toBeVisible()
  })

  it('creates, names, exposes controls for, renames, and deletes a playlist', async () => {
    render(<MemoryRouter><Playlists /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Create playlist' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Playlist name' }), { target: { value: 'Road trip' } })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Playlist name' }), { key: 'Enter' })
    expect(await screen.findByRole('button', { name: 'Edit Road trip' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete Road trip' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Edit Road trip' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Playlist name' }), { target: { value: 'Evening mix' } })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Playlist name' }), { key: 'Enter' })
    expect(await screen.findByRole('button', { name: 'Edit Evening mix' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Delete Evening mix' }))
    expect(await screen.findByText('No playlists yet. Create one to organize your songs.')).toBeVisible()
  })

  it('loads a playlist created on another wallet-connected device', async () => {
    const remote = emptyLibraryDocument()
    remote.playlists['mobile-playlist'] = {
      id: 'mobile-playlist', name: 'Made on mobile', createdAt: 10,
      nameStamp: { at: 10, id: 'mobile' }, lifecycle: 'active',
      lifecycleStamp: { at: 10, id: 'mobile' }, songs: {}
    }
    walletState.document = remote

    render(<MemoryRouter><Playlists /></MemoryRouter>)
    expect(await screen.findByText('Made on mobile')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Edit Made on mobile' })).toBeVisible()
  })

  it('creates a playlist from the add-song modal and adds the selected song', async () => {
    render(<MemoryRouter><SongList songs={[song]} /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Add to Playlist' }))
    fireEvent.click(screen.getByRole('button', { name: '+ Create new playlist' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Playlist name' }), { target: { value: 'Fresh finds' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create & add' }))

    await waitFor(() => {
      expect(useLibraryStore.getState().playlists).toHaveLength(1)
      expect(useLibraryStore.getState().playlists[0].name).toBe('Fresh finds')
      expect(useLibraryStore.getState().playlists[0].songs).toEqual([song])
    })
  })

  it('adds a song to an existing playlist and removes it from the playlist view', async () => {
    const document = emptyLibraryDocument()
    document.playlists['playlist-1'] = {
      id: 'playlist-1', name: 'Road trip', createdAt: 1,
      nameStamp: { at: 1, id: 'test' }, lifecycle: 'active',
      lifecycleStamp: { at: 1, id: 'test' }, songs: {}
    }
    walletState.document = document
    setDocument(document, 'ready')
    const view = render(<MemoryRouter><SongList songs={[song]} /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Add to Playlist' }))
    fireEvent.click(screen.getByRole('button', { name: /Road trip/ }))
    await waitFor(() => expect(useLibraryStore.getState().playlists[0].songs).toEqual([song]))

    view.unmount()
    render(
      <MemoryRouter initialEntries={['/Playlists/playlist-1']}>
        <Routes><Route path="/Playlists/:id" element={<ViewPlaylist />} /></Routes>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remove from this playlist' }))
    expect(await screen.findByText("This playlist doesn't contain any songs yet.")).toBeVisible()
  })
})
