// Dependencies
import { CircularProgress, Modal } from '@mui/material'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Img } from 'uhrp-react'
import { usePlaybackStore } from '../../stores/stores'
import constants from '../../utils/constants'
import deleteSong from '../../utils/deleteSong'

// Assets
import { FaPlay } from 'react-icons/fa'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import placeholderImage from '../../assets/Images/placeholder-image.png'

// Types
import { Playlist, Song } from '../../types/interfaces'

// Styles
import useOutsideClick from '../../hooks/useOutsideClick'
import './SongList.scss'

interface SongListProps {
  songs: Song[]
  style?: Object
  onRemoveFromPlaylist?: (songId: string) => void
  isMySongsOnly?: boolean
}

const SongList = ({ songs, style, onRemoveFromPlaylist, isMySongsOnly }: SongListProps) => {
  // State for tracking actions dropdown visibility
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null)

  // Ref for the dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Effect to add event listener for clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(null) // Close the dropdown if click is outside
      }
    }

    // Always attach the event listener to document, but only take action if dropdownVisible is not null
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownVisible])

  //

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

  useEffect(() => {
    let shouldTogglePlay = false
    let newIndex = -1

    if (playNextSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.audioURL === playbackSong.audioURL)
      newIndex = (currentIndex + 1) % songs.length
      shouldTogglePlay = true
      togglePlayNextSong(false) // Reset the toggle to prevent re-triggering
    } else if (playPreviousSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.audioURL === playbackSong.audioURL)
      newIndex = (currentIndex - 1 + songs.length) % songs.length
      shouldTogglePlay = true
      togglePlayPreviousSong(false) // Reset the toggle to prevent re-triggering
    }

    if (shouldTogglePlay && newIndex !== -1) {
      const newSong = songs[newIndex]
      setPlaybackSong(newSong)
      setIsPlaying(true)
    }
  }, [
    playNextSong,
    playPreviousSong,
    songs,
    playbackSong,
    setPlaybackSong,
    setIsPlaying,
    togglePlayNextSong,
    togglePlayPreviousSong
  ])

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
      selectedSong ? await deleteSong(selectedSong) : null
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
            <button
              className="dropdownToggle"
              onClick={event => {
                event.stopPropagation() // Prevent triggering row selection
                setDropdownVisible(dropdownVisible === info.row.id ? null : info.row.id)
              }}
            >
              <HiOutlineDotsHorizontal style={{ fontSize: '2rem' }} />
            </button>
            {dropdownVisible === info.row.id && (
              <div className="dropdownMenu" ref={dropdownRef}>
                <div
                  onClick={() => {
                    toggleSongLike(info.row.original.audioURL)
                    setDropdownVisible(null) // Close the dropdown
                  }}
                >
                  {isLiked ? 'Unlike' : 'Like'}
                </div>
                <div
                  onClick={() => {
                    const song = info.row.original
                    openAddToPlaylistModal(song)
                    setDropdownVisible(null) // Close the dropdown
                  }}
                >
                  Add to Playlist
                </div>
                {isInPlaylistsPage && (
                  <div
                    onClick={() => {
                      // Assuming info.row.original contains the song object
                      onRemoveFromPlaylist && onRemoveFromPlaylist(info.row.original.audioURL)
                      setDropdownVisible(null) // Close the dropdown
                    }}
                  >
                    Remove from this playlist
                  </div>
                )}
                {isMySongsOnly && (
                  <div
                    onClick={event => {
                      event.stopPropagation() // Prevent triggering row selection
                      openConfirmDeleteModal(info.row.original)
                      setDropdownVisible(null) // Close the dropdown
                    }}
                  >
                    Delete
                  </div>
                )}
              </div>
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

  useOutsideClick(dropdownRef, () => setDropdownVisible(null))

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
