// Dependencies
import { CircularProgress, Modal } from '@mui/material'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Img } from 'uhrp-react'
import { usePlaybackStore } from '../../stores/stores'
import constants from '../../utils/constants'
import deleteSong from '../../utils/deleteSong'

// Assets
import { FaPlay } from 'react-icons/fa'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import placeholderImage from '../../assets/Images/placeholder-image.png'

// Types
import { Playlist, Song } from '../../types/interfaces'

// Styles
import ActionsDropdown from './ActionsDropdown'
import './SongList.scss'

interface SongListProps {
  songs: Song[]
  style?: Object
  onRemoveFromPlaylist?: (songId: string) => void
  isMySongsOnly?: boolean
}

const SongList = ({ songs, style, onRemoveFromPlaylist, isMySongsOnly }: SongListProps) => {

  const navigate = useNavigate()

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
      const currentIndex = songs.findIndex(song => song.songURL === playbackSong.songURL)
      newIndex = (currentIndex + 1) % songs.length
      shouldTogglePlay = true
      togglePlayNextSong(false) // Reset the toggle to prevent re-triggering
    } else if (playPreviousSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.songURL === playbackSong.songURL)
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

  const handleDoubleClick = (song: Song) => {
    setPlaybackSong({
      title: song.title,
      artist: song.artist,
      songURL: song.songURL,
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
    columnHelper.accessor('songURL', {
      header: '',
      cell: info => {
        // Deconstruct song data from the row's object data to provide it to the img element
        const { title, artist, songURL, artworkURL } = info.row.original

        return (
          <div
            className="songListArtworkContainer"
            onClick={() => {
              setPlaybackSong({
                title: title,
                artist: artist,
                songURL: songURL,
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
      cell: info => {
        return (
          <span
            className="artistName"
            onClick={() => {
              navigate(`/Artist/${info.row.original.artistIdentityKey}`) // Ensure you're navigating using the artistId or a relevant identifier
            }}
          >
            {info.getValue()}
          </span>
        )
      }
    }),
    columnHelper.accessor('songURL', {
      id: 'actions',
      header: '',
      cell: info => {
        return (
          <ActionsDropdown
            info={info}
            openAddToPlaylistModal={openAddToPlaylistModal}
            openConfirmDeleteModal={openConfirmDeleteModal}
            onRemoveFromPlaylist={onRemoveFromPlaylist}
            isMySongsOnly={isMySongsOnly}
          />
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

  /**
   * Adds a song to a specified playlist by its ID, if the song is not already present.
   * It updates both the state and local storage with the new playlist data.
   *
   * @param playlistId The unique ID of the playlist to which the song will be added.
   * @param song The song object to be added to the playlist.
   */
  const addSongToPlaylist = (playlistId: string, song: Song) => {
    // Map over the current playlists to produce a new array of updated playlists.
    const updatedPlaylists = playlists.map(playlist => {
      // Check if the current playlist is the one to update.
      if (playlist.id === playlistId) {
        // Check if the song already exists in the playlist to avoid duplicates.
        const songExists = playlist.songs.some(s => s.songURL === song.songURL)
        if (!songExists) {
          // If the song does not exist, show a success message to the user.
          toast.success(`Added ${song.title} by ${song.artist} to playlist: ${playlist.name}`)
          // Return a new playlist object with the new song added.
          return { ...playlist, songs: [...playlist.songs, song] }
        }
      }
      // For playlists that are not being updated or if the song exists, return them as is.
      return playlist
    })

    // Update the playlists state with the new list of playlists.
    setPlaylists(updatedPlaylists)
    // Also update the local storage to persist changes between sessions.
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists))
  }

  // const handleRemoveSongFromPlaylist = (song: Song) => {
  //   // Invoke the callback with the song's unique identifier
  //   if (onRemoveFromPlaylist) {
  //     onRemoveFromPlaylist(song.songURL)
  //   } else {
  //     toast.error('Erorr removing from playlist. Function onRemovePlaylist was not found.')
  //   }
  // }

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
