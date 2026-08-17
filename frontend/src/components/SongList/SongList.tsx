/**
 * @file SongList.tsx
 * @description
 * React component for displaying a list of songs in a table format for Tempo.
 * Provides playback, playlist management, and song-specific actions like delete or share.
 * Includes modals for adding songs to playlists and confirming deletion.
 */

import React, { useEffect, useState, useRef } from 'react'
import { Modal, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { FaPlay } from 'react-icons/fa'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import uuid4 from 'uuid4'

import { usePlaybackStore } from '../../stores/stores'
import { useLibraryStore } from '../../stores/libraryStore'
import ActionsDropdown from './ActionsDropdown'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import ArtworkImage from '../ArtworkImage/ArtworkImage'
import LibrarySyncStatus from '../LibrarySyncStatus/LibrarySyncStatus'
import { prepareSongPlayback } from '../../utils/playbackSelection'

import type { Song } from '../../types/interfaces'

import './SongList.scss'

/**
 * Props for the SongList component.
 */
interface SongListProps {
  songs: Song[]
  style?: React.CSSProperties
  onRemoveFromPlaylist?: (songId: string) => void
  isMySongsOnly?: boolean
}

/**
 * SongList Component
 *
 * Renders a table of songs with artwork, titles, artists, and action buttons.
 * - Supports playback control (double-click to play).
 * - Integrates with playback state via Zustand.
 * - Provides add-to-playlist and delete modals.
 * - Uses TanStack React Table for flexible rendering of columns and rows.
 *
 * Columns:
 * - Artwork + Play button
 * - Song title
 * - Artist name (links to artist profile)
 * - Actions dropdown
 *
 * Features:
 * - Double-click to start playback.
 * - Navigate to artist page on click.
 * - Wallet-backed playlist management with an offline browser cache.
 * - Modals for adding to playlists and confirming deletion.
 */
const SongList = ({ songs, style, onRemoveFromPlaylist, isMySongsOnly = false }: SongListProps) => {
  const navigate = useNavigate()

  const [selectedSongIndex, setSelectedSongIndex] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false)
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
  const [isDeletingSong, setIsDeletingSong] = useState(false)
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false)
  const playlists = useLibraryStore(state => state.playlists)
  const initializeLibrary = useLibraryStore(state => state.initializeLibrary)
  const createPlaylist = useLibraryStore(state => state.createPlaylist)
  const addSongToLibraryPlaylist = useLibraryStore(state => state.addSongToPlaylist)
  const [localSongs, setLocalSongs] = useState<Song[]>(songs)
  const scrollPositionRef = useRef(0)

  const {
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    playNextSong,
    setSongList,
    playPreviousSong,
    togglePlayNextSong,
    togglePlayPreviousSong,
    requestAutoUnlock
  } = usePlaybackStore()

  useEffect(() => {
    setSongList(songs)
  }, [songs, setSongList])

  useEffect(() => {
    setLocalSongs(songs)
  }, [songs])

  // Lock scroll when modal opens, restore when it closes
useEffect(() => {
  if (isAddToPlaylistModalOpen || isConfirmDeleteModalOpen) {
    scrollPositionRef.current = window.scrollY
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
    // Restore scroll position for both desktop and mobile
    window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
  }

  return () => {
    document.body.style.overflow = 'auto'
  }
}, [isAddToPlaylistModalOpen, isConfirmDeleteModalOpen])

// Trigger a re-render of the song list when modals close
useEffect(() => {
  if (!isAddToPlaylistModalOpen && !isConfirmDeleteModalOpen) {
    setLocalSongs([...songs])
  }
}, [isAddToPlaylistModalOpen, isConfirmDeleteModalOpen, songs])

  useEffect(() => {
    if (isAddToPlaylistModalOpen) void initializeLibrary()
  }, [initializeLibrary, isAddToPlaylistModalOpen])


  useEffect(() => {
    const index = songs.findIndex(song => song.songURL === playbackSong.songURL)
    if (playNextSong && songs.length > 0) {
      const newSong = songs[(index + 1) % songs.length]
      setPlaybackSong(newSong)
      setIsPlaying(true)
      togglePlayNextSong()
    } else if (playPreviousSong && songs.length > 0) {
      const newSong = songs[(index - 1 + songs.length) % songs.length]
      setPlaybackSong(newSong)
      setIsPlaying(true)
      togglePlayPreviousSong()
    }
  }, [
    playNextSong,
    playPreviousSong,
    playbackSong,
    songs,
    setIsPlaying,
    setPlaybackSong,
    togglePlayNextSong,
    togglePlayPreviousSong
  ])

  /**
   * Handle double-clicking a song row to start playback.
   */
  const playSelectedSong = (song: Song) => {
    const prepared = prepareSongPlayback(song, playbackSong)
    if (prepared.autoUnlock) {
      requestAutoUnlock(prepared.song)
      return
    }
    setPlaybackSong(prepared.song)
    setIsPlaying(true)
  }

  /**
   * Confirm and delete the selected song, updating UI state and notifying the user.
   */
const handleDeleteSong = async () => {
    if (!selectedSong) return
    setIsDeletingSong(true)
    try {
      const { default: deleteSong } = await import('../../utils/deleteSong')
      await deleteSong(selectedSong)
    } catch (e) {
      toast.error(`Error deleting song: ${e}`)
    } finally {
  if (selectedSong) {
    setLocalSongs(prev => prev.filter(s => s.songURL !== selectedSong.songURL))
  }
  setIsDeletingSong(false)
  setIsConfirmDeleteModalOpen(false)
}

  }

  /**
   * Add the selected song to the chosen wallet-backed playlist.
   */
  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const playlist = playlists.find(item => item.id === playlistId)
    if (!playlist) return
    if (playlist.songs.some(item => item.songURL === song.songURL)) {
      toast.info(`${song.title} is already in ${playlist.name}`)
      setIsAddToPlaylistModalOpen(false)
      return
    }
    await addSongToLibraryPlaylist(playlistId, song)
    toast.success(`Added ${song.title} to ${playlist.name}`)
    setIsAddToPlaylistModalOpen(false)
  }

  const createPlaylistWithSelectedSong = async () => {
    const name = newPlaylistName.trim()
    if (!name || !selectedSong) return
    setIsSavingPlaylist(true)
    try {
      await createPlaylist(uuid4(), name, [selectedSong])
      toast.success(`Created ${name} and added ${selectedSong.title}`)
      setNewPlaylistName('')
      setIsCreatingPlaylist(false)
      setIsAddToPlaylistModalOpen(false)
    } finally {
      setIsSavingPlaylist(false)
    }
  }

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false)
    setIsCreatingPlaylist(false)
    setNewPlaylistName('')
  }

  const columns = [
    createColumnHelper<Song>().accessor('songURL', {
      header: 'Play',
      cell: ({ row }) => {
        const song = row.original
        const isIndependent = song.isPublished

        return (
          <button
            className="songListArtworkContainer"
            onClick={(event) => {
              event.stopPropagation()
              playSelectedSong(song)
            }}
            aria-label={`${isIndependent ? 'Buy and play' : 'Play'} ${song.title} by ${song.artist}`}
          >
            <FaPlay className="artworkThumbnailPlayIcon" />
            <ArtworkImage
              src={song.artworkURL || placeholderImage}
              alt={`${song.title} artwork`}
              className="songListArtworkThumbnail"
            />
            {isIndependent && (
              <div className="previewFlag">{song.availability?.priceSatoshis || 1000} sats</div>
            )}
          </button>
        )
      }
    }),
    createColumnHelper<Song>().accessor('title', {
      header: 'Title',
      cell: ({ row, getValue }) => (
        <div className="songTitleContent">
          <span>{getValue()}</span>
          {row.original.isPublished && (
            <span className="songPrice">Buy &amp; play · {row.original.availability?.priceSatoshis || 1000} sats</span>
          )}
        </div>
      )
    }),
    createColumnHelper<Song>().accessor('artist', {
      header: 'Artist',
      cell: ({ row, getValue }) => (
        <span
          className="artistName"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/Artist/${row.original.artistIdentityKey}`)
          }}
        >
          {getValue()}
        </span>
      )
    }),
    createColumnHelper<Song>().accessor('songURL', {
      id: 'actions',
      header: '',
      cell: info => {
    return (
      <ActionsDropdown
        info={info}
        openAddToPlaylistModal={song => {
          setSelectedSong(song)
          setIsAddToPlaylistModalOpen(true)
        }}
        openConfirmDeleteModal={song => {
          setSelectedSong(song)
          setIsConfirmDeleteModalOpen(true)
        }}
        onRemoveFromPlaylist={onRemoveFromPlaylist}
        isMySongsOnly={isMySongsOnly}
      />
      )
    }
    })
  ]

  const table = useReactTable({
    data: localSongs,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      {/* Add to Playlist Modal */}
      <Modal open={isAddToPlaylistModalOpen} onClose={closeAddToPlaylistModal}>
        <div className="addToPlayListModal">
          <div className="modalHeaderRow">
            <h1>Add to playlist</h1>
            <div className="flexSpacer" />
            <button type="button" className="modalCloseButton" onClick={closeAddToPlaylistModal} aria-label="Close add to playlist">
              <IoIosCloseCircleOutline color="white" className="modalCloseIcon" aria-hidden="true" />
            </button>
          </div>
          <LibrarySyncStatus />
          {!isCreatingPlaylist ? (
            <button
              type="button"
              className="createPlaylistInModalButton"
              onClick={() => setIsCreatingPlaylist(true)}
            >
              + Create new playlist
            </button>
          ) : (
            <form
              className="createPlaylistInModalForm"
              onSubmit={event => {
                event.preventDefault()
                void createPlaylistWithSelectedSong()
              }}
            >
              <label htmlFor="new-playlist-name">Playlist name</label>
              <div>
                <input
                  id="new-playlist-name"
                  autoFocus
                  value={newPlaylistName}
                  placeholder="e.g. Evening drive"
                  onChange={event => setNewPlaylistName(event.target.value)}
                />
                <button type="submit" disabled={!newPlaylistName.trim() || isSavingPlaylist}>
                  {isSavingPlaylist ? 'Saving…' : 'Create & add'}
                </button>
              </div>
            </form>
          )}
          {playlists.map(p => (
            <button
              type="button"
              className="playlistName"
              key={p.id}
              onClick={() => {
                if (selectedSong) {
                  void addSongToPlaylist(p.id, selectedSong)
                }
              }}
            >
              {p.name}
              <span>{p.songs.length} {p.songs.length === 1 ? 'song' : 'songs'}</span>
            </button>
          ))}
          {playlists.length === 0 && (
            <p className="emptyModalState">No playlists yet. Create one here and this song will be added automatically.</p>
          )}
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)}>
        <div className="confirmDeleteModal">
          <div className="modalHeaderRow">
            <h1>Are you sure you want to delete this song?</h1>
            <div className="flexSpacer" />
            <button
              type="button"
              className="modalCloseButton"
              onClick={() => setIsConfirmDeleteModalOpen(false)}
              aria-label="Close delete confirmation"
            >
              <IoIosCloseCircleOutline color="white" className="modalCloseIcon" aria-hidden="true" />
            </button>
          </div>
          <div className="flex">
            <button
              className="button deleteButton"
              onClick={handleDeleteSong}
              disabled={isDeletingSong}
            >
              {isDeletingSong ? <CircularProgress size={20} /> : 'Delete'}
            </button>
            <button
              className="button cancelButton"
              onClick={() => setIsConfirmDeleteModalOpen(false)}
              disabled={isDeletingSong}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <div className="songListTableWrap">
        <table className="songListTable" style={style}>
          <thead>
            {table.getHeaderGroups().map(group => (
              <tr key={group.id}>
                {group.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`songRow ${selectedSongIndex === row.id ? 'selectedRow' : ''}`}
                onClick={() => {
                  setSelectedSongIndex(row.id)
                  playSelectedSong(row.original)
                }}
              >
                {row.getVisibleCells().map(cell => {
                  const headerValue = cell.column.columnDef.header
                  const label =
                    typeof headerValue === 'string'
                      ? headerValue || 'Play'
                      : cell.column.id === 'actions'
                        ? 'Actions'
                        : ''

                  return (
                    <td key={cell.id} data-label={label} data-column={cell.column.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default SongList
