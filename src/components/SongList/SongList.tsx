import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { FaPlay, FaHeart, FaRegHeart, FaListUl, FaTrash } from 'react-icons/fa'
import { IoIosCloseCircleOutline } from 'react-icons/io'

import { Img } from 'uhrp-react'
import { usePlaybackStore } from '../../stores/stores'
import { Playlist, Song } from '../../types/interfaces'
import { CircularProgress, Modal } from '@mui/material'
import { toast } from 'react-toastify'

import constants from '../../utils/constants'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import './SongList.scss'
import deleteSong from '../../utils/deleteSong'

interface SongListProps {
  songs: Song[]
  style?: Object
  onRemoveFromPlaylist?: (songId: string) => void
  isMySongsOnly?: boolean
}

const SongList = ({ songs, style, onRemoveFromPlaylist, isMySongsOnly }: SongListProps) => {
  // Determine whether component is being used in the playlists component
  const location = useLocation()
  const isInPlaylistsPage = location.pathname.includes('Playlists')

  // Liked songs ==============================================================

  const [likedSongs, setLikedSongs] = useState<string[]>([])
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedSongs')
    setLikedSongs(storedLikes ? storedLikes.split(',') : [])
  }, [])

  // Selected song ============================================================

  // Index of selected song
  const [selectedSongIndex, setSelectedSongIndex] = useState<string | null>(null)

  // Selected Song object
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  // Global state for audio playback ===========================================

  const [
    isPlaying,
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    playNextSong,
    setSongList,
    playPreviousSong,
    togglePlayNextSong,
    togglePlayPreviousSong
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.playNextSong,
    state.setSongList,
    state.playPreviousSong,
    state.togglePlayNextSong,
    state.togglePlayPreviousSong
  ])

  // Autoplay after song end =================================================

  // First load check to prevent playing first song on component mount
  const [firstLoad, setFirstLoad] = useState(true)
  useEffect(() => {
    if (playPreviousSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.audioURL === playbackSong.audioURL)
      if (currentIndex !== -1) {
        const previousIndex = (currentIndex - 1 + songs.length) % songs.length
        const previousSong = songs[previousIndex]
        setPlaybackSong(previousSong)
        setIsPlaying(true)
        // Reset the toggle to prevent re-triggering
        togglePlayPreviousSong(false)
      }
    }
    // Ensure dependencies list is correct to avoid missing updates or unnecessary effect calls
  }, [playPreviousSong, songs, playbackSong, setPlaybackSong, setIsPlaying, togglePlayPreviousSong])

  useEffect(() => {
    if (playNextSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.audioURL === playbackSong.audioURL)
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % songs.length
        const nextSong = songs[nextIndex]
        setPlaybackSong(nextSong)
        setIsPlaying(true)
        // Reset the toggle to prevent re-triggering
        togglePlayNextSong(false)
      }
    }
    // Ensure dependencies list is correct to avoid missing updates or unnecessary effect calls
  }, [playNextSong, songs, playbackSong, setPlaybackSong, setIsPlaying, togglePlayNextSong])

  // Update global song list state when changed ===============

  useEffect(() => {
    setSongList(songs)
  }, [songs])

  // Handlers ==================================================

  const toggleSongLike = (audioURL: string) => {
    let updatedLikedSongs
    if (likedSongs.includes(audioURL)) {
      // Remove the song from likedSongs if it's already liked
      updatedLikedSongs = likedSongs.filter(song => song !== audioURL)
    } else {
      // Add the song to likedSongs if it's not already liked
      updatedLikedSongs = [...likedSongs, audioURL]
    }
    // Update state and localStorage with the new list of liked songs
    setLikedSongs(updatedLikedSongs)
    localStorage.setItem('likedSongs', updatedLikedSongs.join(','))
  }

  const handleDoubleClick = (song: Song) => {
    setPlaybackSong({
      title: song.title,
      artist: song.artist,
      audioURL: song.audioURL,
      artworkURL: song.artworkURL
    })
    setIsPlaying(true) // Start playback immediately
  }

  const [isDeletingSong, setIsDeletingSong] = useState(false)
  const handleDeleteSong = async () => {
    setIsDeletingSong(true)
    try {
      selectedSong ? await deleteSong({ song: selectedSong }) : null
      toast.success('Succesfully deleted song')
    } catch (e) {
      toast.error(`Error deleting song: ${e}`)
    } finally {
      setIsDeletingSong(false)
      setIsConfirmDeleteModalOpen(false)
    }
  }

  // Add to playlist modal ==================================================

  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false)
  const openAddToPlaylistModal = (song: Song) => {
    setIsAddToPlaylistModalOpen(true)
    setSelectedSong(song)
  }
  const closeAddToPlaylistModal = () => setIsAddToPlaylistModalOpen(false)

  // Confirm delete modal ===================================================

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
  const openConfirmDeleteModal = (song: Song) => {
    setIsConfirmDeleteModalOpen(true)
    setSelectedSong(song)
  }
  const closeConfirmDeleteModal = () => setIsConfirmDeleteModalOpen(false)

  // Table ==================================================================

  const columnHelper = createColumnHelper<Song>()

  // Define columns for React Table
  const columns = [
    columnHelper.accessor('audioURL', {
      header: '',
      cell: info => {
        // Deconstruct song data from the row's object data to provide it to the img element
        const { title, artist, audioURL, artworkURL } = info.row.original

        return (
          <div
            className="songListArtworkContainer"
            onClick={() => {
              setPlaybackSong({
                title: title,
                artist: artist,
                audioURL: audioURL,
                artworkURL: artworkURL
              })
            }}
          >
            <FaPlay className="artworkThumbnailPlayIcon" />

            <Img
              src={artworkURL}
              className="songListArtworkThumbnail"
              confederacyHost={constants.confederacyURL}
              //@ts-ignore TODO: update uhrp-react to not throw TS errors for img attributes
              // Set the image to a placeholder if an image was not found
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement
                target.src = placeholderImage
              }}
            />
          </div>
        )
      }
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('artist', {
      header: 'Artist',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('audioURL', {
      id: 'actions',
      header: '',
      cell: info => {
        const isLiked = likedSongs.includes(info.row.original.audioURL)
        return (
          <div className="actionsContainer flex">
            <div
              onClick={() => {
                toggleSongLike(info.row.original.audioURL)
              }}
              style={{ width: 'fit-content' }}
            >
              {isLiked ? (
                <FaHeart className={`likedIcon ${isLiked ? 'alwaysVisible' : ''}`} />
              ) : (
                <FaRegHeart className="likedIcon" />
              )}
            </div>
            <FaListUl
              className="addToPlaylistIcon"
              color="white"
              onClick={() => {
                const song = info.row.original
                openAddToPlaylistModal(song)
              }}
            />

            {isInPlaylistsPage && (
              <FaTrash
                className="deleteFromPlaylistIcon"
                color="white"
                onClick={event => {
                  // Prevent event propagation to avoid triggering row selection or other actions
                  event.stopPropagation()
                  handleRemoveSongFromPlaylist(info.row.original)
                }}
              />
            )}

            {isMySongsOnly && (
              <FaTrash
                className="deleteFromPlaylistIcon"
                color="white"
                onClick={event => {
                  // Prevent event propagation to avoid triggering row selection or other actions
                  event.stopPropagation()
                  openConfirmDeleteModal(info.row.original)
                  // deleteSong({ song: info.row.original })
                }}
              />
            )}
          </div>
        )
      }
    })
  ]

  const table = useReactTable({
    data: songs,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // Playlists =====================================================

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  useEffect(() => {
    const playlistStorage = localStorage.getItem('playlists')
    if (playlistStorage) {
      setPlaylists(JSON.parse(playlistStorage))
    }
  }, [])

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const songExists = playlist.songs.some(s => s.audioURL === song.audioURL)
        if (!songExists) {
          // Show a toast message when the song is added
          toast.success(`Added ${song.title} by ${song.artist} to playlist: ${playlist.name}`)
          return { ...playlist, songs: [...playlist.songs, song] }
        }
      }
      return playlist
    })

    setPlaylists(updatedPlaylists)
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists))
  }

  // Adjust the deletion function to call onSongDelete
  const handleRemoveSongFromPlaylist = (song: Song) => {
    // Invoke the callback with the song's unique identifier
    if (onRemoveFromPlaylist) {
      onRemoveFromPlaylist(song.audioURL)
    } else {
      toast.error('Erorr removing from playlist. Function onRemovePlaylist was not found.')
    }
  }

  // Render ========================================================
  return (
    <>
      {/* Add to playlist modal */}
      <Modal open={isAddToPlaylistModalOpen} onClose={closeAddToPlaylistModal}>
        <div className="addToPlayListModal">
          <div className="flex" style={{ marginBottom: '1rem' }}>
            <h1>Add to playlist</h1>
            <div className="flexSpacer" />
            <IoIosCloseCircleOutline
              color="white"
              onClick={closeAddToPlaylistModal}
              className="modalCloseIcon"
            />
          </div>
          {playlists.map((playlist: Playlist) => (
            <div
              key={playlist.id}
              onClick={() => selectedSong && addSongToPlaylist(playlist.id, selectedSong)}
              style={{ cursor: 'pointer' }}
            >
              <h2 className="playlistName">{playlist.name}</h2>
            </div>
          ))}
        </div>
      </Modal>

      {/* Confirm delete song modal (MySongs only) */}
      <Modal open={isConfirmDeleteModalOpen} onClose={closeConfirmDeleteModal}>
        <div className="confirmDeleteModal">
          <div className="flex" style={{ marginBottom: '1rem' }}>
            <h1>Are you sure you want to delete this song?</h1>
            <div className="flexSpacer" />
            <IoIosCloseCircleOutline
              color="white"
              onClick={closeConfirmDeleteModal}
              className="modalCloseIcon"
            />
          </div>
          <div className="flex">
            <button
              className="button deleteButton"
              onClick={handleDeleteSong}
              disabled={isDeletingSong}
            >
              {isDeletingSong ? (
                <CircularProgress color="inherit" className="buttonLoadingSpinner" size={20} />
              ) : (
                'Delete'
              )}
            </button>
            <button
              className="button cancelButton"
              onClick={closeConfirmDeleteModal}
              disabled={isDeletingSong}
            >
              {isDeletingSong ? (
                <CircularProgress color="inherit" className="buttonLoadingSpinner" size={20} />
              ) : (
                'Cancel'
              )}
            </button>
          </div>
        </div>
      </Modal>

      <table className={`songListTable ${style}`}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
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
