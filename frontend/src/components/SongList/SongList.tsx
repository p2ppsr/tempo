import React, { useEffect, useState } from 'react'
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
import deleteSong from '../../utils/deleteSong'
import ActionsDropdown from './ActionsDropdown'

import placeholderImage from '../../assets/Images/placeholder-image.png'
import type { Playlist, Song } from '../../types/interfaces'

import './SongList.scss'

interface SongListProps {
  songs: Song[]
  style?: React.CSSProperties
  onRemoveFromPlaylist?: (songId: string) => void
  isMySongsOnly?: boolean
}

const SongList = ({ songs, style, onRemoveFromPlaylist, isMySongsOnly }: SongListProps) => {
  const navigate = useNavigate()

  const [selectedSongIndex, setSelectedSongIndex] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false)
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
  const [isDeletingSong, setIsDeletingSong] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const [
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    playNextSong,
    setSongList,
    playPreviousSong,
    togglePlayNextSong,
    togglePlayPreviousSong
  ] = usePlaybackStore((state: any) => [
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.playNextSong,
    state.setSongList,
    state.playPreviousSong,
    state.togglePlayNextSong,
    state.togglePlayPreviousSong
  ])

  useEffect(() => {
    setSongList(songs)
  }, [songs])

  useEffect(() => {
    const index = songs.findIndex(song => song.songURL === playbackSong.songURL)
    if (playNextSong && songs.length > 0) {
      const newSong = songs[(index + 1) % songs.length]
      setPlaybackSong(newSong)
      setIsPlaying(true)
      togglePlayNextSong(false)
    } else if (playPreviousSong && songs.length > 0) {
      const newSong = songs[(index - 1 + songs.length) % songs.length]
      setPlaybackSong(newSong)
      setIsPlaying(true)
      togglePlayPreviousSong(false)
    }
  }, [playNextSong, playPreviousSong, playbackSong, songs])

  useEffect(() => {
    const local = localStorage.getItem('playlists')
    if (local) setPlaylists(JSON.parse(local))
  }, [])

  const handleDoubleClick = (song: Song) => {
    setPlaybackSong(song)
    setIsPlaying(true)
  }

  const handleDeleteSong = async () => {
    if (!selectedSong) return
    setIsDeletingSong(true)
    try {
      await deleteSong(selectedSong)
      toast.success('Successfully deleted song')
    } catch (e) {
      toast.error(`Error deleting song: ${e}`)
    } finally {
      setIsDeletingSong(false)
      setIsConfirmDeleteModalOpen(false)
    }
  }

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
  }

  const columns = [
    createColumnHelper<Song>().accessor('songURL', {
      header: '',
      cell: ({ row }) => (
        <div
          className="songListArtworkContainer"
          onClick={() => setPlaybackSong(row.original)}
        >
          <FaPlay className="artworkThumbnailPlayIcon" />
          <img
            src={row.original.artworkURL || placeholderImage}
            alt={`${row.original.title} artwork`}
            className="songListArtworkThumbnail"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = placeholderImage
            }}
          />
        </div>
      )
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
      cell: info => (
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
    })
  ]

  const table = useReactTable({
    data: songs,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      {/* Add to Playlist Modal */}
      <Modal open={isAddToPlaylistModalOpen} onClose={() => setIsAddToPlaylistModalOpen(false)}>
        <div className="addToPlayListModal">
          <div className="flex" style={{ marginBottom: '1rem' }}>
            <h1>Add to playlist</h1>
            <div className="flexSpacer" />
            <IoIosCloseCircleOutline
              color="white"
              onClick={() => setIsAddToPlaylistModalOpen(false)}
              className="modalCloseIcon"
            />
          </div>
          {playlists.map(p => (
            <div key={p.id} onClick={() => selectedSong && addSongToPlaylist(p.id, selectedSong)}>
              <h2 className="playlistName">{p.name}</h2>
            </div>
          ))}
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)}>
        <div className="confirmDeleteModal">
          <div className="flex" style={{ marginBottom: '1rem' }}>
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
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default SongList
