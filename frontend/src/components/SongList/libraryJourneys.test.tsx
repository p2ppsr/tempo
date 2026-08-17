import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
import Playlists from '../../pages/Playlists/Playlists'

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
    useLibraryStore.setState({ likedSongIds: [], playlists: [] })
  })

  it('shows Like until the listener explicitly likes the song', () => {
    render(
      <ActionsDropdown
        info={{ row: { id: 'row-1', original: song } }}
        openAddToPlaylistModal={vi.fn()}
        openConfirmDeleteModal={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Dawnvisions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Like' }))

    expect(screen.getByRole('menuitem', { name: 'Unlike' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('likedSongs') ?? '[]')).toEqual(['tempo-song-1'])
  })

  it('keeps named playlist edit and delete controls available without selection', () => {
    useLibraryStore.setState({
      playlists: [{ id: 'playlist-1', name: 'Road trip', songs: [] }]
    })

    render(<MemoryRouter><Playlists /></MemoryRouter>)

    expect(screen.getByRole('button', { name: 'Edit Road trip' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete Road trip' })).toBeVisible()
  })
})
