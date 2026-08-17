import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('library journeys', () => {
  beforeEach(() => {
    localStorage.clear()
    window.scrollTo = vi.fn()
    useLibraryStore.setState({ likedSongIds: [], playlists: [] })
  })

  afterEach(cleanup)

  it('shows Like until the listener explicitly likes the song', () => {
    render(<MemoryRouter><ActionsDropdown
      info={{ row: { id: 'row-1', original: song } }}
      openAddToPlaylistModal={vi.fn()}
      openConfirmDeleteModal={vi.fn()}
    /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Like' }))

    expect(screen.getByRole('menuitem', { name: 'Unlike' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('likedSongs') ?? '[]')).toEqual(['tempo-song-1'])

    fireEvent.click(screen.getByRole('menuitem', { name: 'Unlike' }))
    expect(screen.getByRole('menuitem', { name: 'Like' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('likedSongs') ?? '[]')).toEqual([])
  })

  it('creates, renames, exposes controls for, and deletes a playlist', () => {
    render(<MemoryRouter><Playlists /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Create playlist' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Road trip' } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.getByRole('button', { name: 'Edit Road trip' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete Road trip' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Edit Road trip' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Evening mix' } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.getByRole('button', { name: 'Edit Evening mix' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Delete Evening mix' }))
    expect(screen.getByText('No playlists yet. Create one to organize your songs.')).toBeVisible()
  })

  it('adds a song to a playlist and removes it from the playlist view', () => {
    useLibraryStore.setState({ playlists: [{ id: 'playlist-1', name: 'Road trip', songs: [] }] })
    const view = render(<MemoryRouter><SongList songs={[song]} /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Add to Playlist' }))
    fireEvent.click(screen.getByRole('heading', { name: 'Road trip' }))
    expect(useLibraryStore.getState().playlists[0].songs).toEqual([song])

    view.unmount()
    render(
      <MemoryRouter initialEntries={['/Playlists/playlist-1']}>
        <Routes><Route path="/Playlists/:id" element={<ViewPlaylist />} /></Routes>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remove from this playlist' }))
    expect(screen.getByText("This playlist doesn't contain any songs yet.")).toBeVisible()
  })
})
