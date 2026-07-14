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

import { usePlaybackStore } from '../../stores/stores'
import ActionsDropdown from './ActionsDropdown'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import ArtworkImage from '../ArtworkImage/ArtworkImage'

import type { Playlist, Song } from '../../types/interfaces'

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
 * - Local playlist management using localStorage.
 * - Modals for adding to playlists and confirming deletion.
 */
const SongList = ({ songs, style, onRemoveFromPlaylist, isMySongsOnly = false }: SongListProps) => {
  const navigate = useNavigate()

  const [selectedSongIndex, setSelectedSongIndex] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false)
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
  const [isDeletingSong, setIsDeletingSong] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
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
    togglePlayPreviousSong
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

  useEffect(() => {
    const local = localStorage.getItem('playlists')
    if (local) setPlaylists(JSON.parse(local))
  }, [])


  /**
   * Handle double-clicking a song row to start playback.
   */
  const handleDoubleClick = (song: Song) => {
    setPlaybackSong({ ...song })
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
   * Add the selected song to the chosen playlist, updating local state and localStorage.
   */
  const addSongToPlaylist = (playlistId: string, song: Song) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId && !p.songs.some(s => s.songURL === song.songURL)) {
        toast.success(`Added ${song.title} to ${p.name}`)
        return { ...p, songs: [...p.songs, song] }
      }
      return p
    })
    setPlaylists(updated)
    localStorage.setItem('playlists', JSON.stringify(updated))
    setIsAddToPlaylistModalOpen(false)
  }

  const columns = [
    createColumnHelper<Song>().accessor('songURL', {
      header: 'Play',
      cell: ({ row }) => {
        const song = row.original
        const isPreviewOnly = !song.decryptedSongURL && !!song.previewURL

        const handlePlay = () => {
          const songToPlay = { ...song }
          if (isPreviewOnly) {
            songToPlay.decryptedSongURL = song.previewURL
          }
          setPlaybackSong(songToPlay)
          setIsPlaying(true)
        }

        return (
          <button className="songListArtworkContainer" onClick={handlePlay} aria-label={`Play ${song.title} by ${song.artist}`}>
            <FaPlay className="artworkThumbnailPlayIcon" />
            <ArtworkImage
              src={song.artworkURL || placeholderImage}
              alt={`${song.title} artwork`}
              className="songListArtworkThumbnail"
            />
            {isPreviewOnly && (
              <div className="previewFlag">Preview</div>
            )}
          </button>
        )
      }
    }),
    createColumnHelper<Song>().accessor('title', {
      header: 'Title',
      cell: info => info.getValue()
    }),
    createColumnHelper<Song>().accessor('artist', {
      header: 'Artist',
      cell: ({ row, getValue }) => (
        <span
          className="artistName"
          onClick={() => navigate(`/Artist/${row.original.artistIdentityKey}`)}
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
      <Modal open={isAddToPlaylistModalOpen} onClose={() => setIsAddToPlaylistModalOpen(false)}>
        <div className="addToPlayListModal">
          <div className="modalHeaderRow">
            <h1>Add to playlist</h1>
            <div className="flexSpacer" />
            <IoIosCloseCircleOutline
              color="white"
              onClick={() => setIsAddToPlaylistModalOpen(false)}
              className="modalCloseIcon"
            />
          </div>
          {playlists.map(p => (
            <div
              key={p.id}
              onClick={() => {
                if (selectedSong) {
                  addSongToPlaylist(p.id, selectedSong)
                  setIsAddToPlaylistModalOpen(false)
                }
              }}
            >
              <h2 className="playlistName">{p.name}</h2>
            </div>
          ))}
          {playlists.length === 0 && (
            <p className="emptyModalState">Create a playlist first to save this track.</p>
          )}
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)}>
        <div className="confirmDeleteModal">
          <div className="modalHeaderRow">
            <h1>Are you sure you want to delete this song?</h1>
            <div className="flexSpacer" />
            <IoIosCloseCircleOutline
              color="white"
              onClick={() => setIsConfirmDeleteModalOpen(false)}
              className="modalCloseIcon"
            />
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
                onClick={() => setSelectedSongIndex(row.id)}
                onDoubleClick={() => handleDoubleClick(row.original)}
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
                    <td key={cell.id} data-label={label}>
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
