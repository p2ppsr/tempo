import React, { useEffect, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { FaPlay, FaHeart, FaRegHeart, FaListUl } from 'react-icons/fa'
import { IoIosCloseCircleOutline } from 'react-icons/io'

import { Img } from 'uhrp-react'
import { usePlaybackStore } from '../../stores/stores'
import { Playlist, Song } from '../../types/interfaces'
import constants from '../../utils/constants'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import './SongList.scss'
import { Modal } from '@mui/material'

interface SongListProps {
  songs: Song[]
  style?: Object
}

const SongList = ({ songs, style }: SongListProps) => {
  // Liked songs ==================================================

  const [likedSongs, setLikedSongs] = useState<string[]>([])
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedSongs')
    setLikedSongs(storedLikes ? storedLikes.split(',') : [])
  }, [])

  // Selected song ===============================================

  const [selectedSongIndex, setSelectedSongIndex] = useState<string | null>(null)

  // Global state for audio playback =============================

  const [
    isPlaying,
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    playNextSong
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.playNextSong
  ])

  // Autoplay after song end =================================================

  // First load check to prevent playing first song on component mount
  const [firstLoad, setFirstLoad] = useState(true)

  useEffect(() => {
    // If the first load, toggle the state and return early
    if (firstLoad) {
      setFirstLoad(false)
      return
    }

    // Get the index of the current playing song and set the playback to the next song
    const currentSongIndex = songs.findIndex(song => song.audioURL === playbackSong.audioURL)
    const nextSongIndex = (currentSongIndex + 1) % songs.length // Loop back to the first song if at the end
    const nextSong = songs[nextSongIndex]
    setPlaybackSong({
      title: nextSong.title,
      artist: nextSong.artist,
      audioURL: nextSong.audioURL,
      artworkURL: nextSong.artworkURL
    })
    setIsPlaying(true)
  }, [playNextSong]) // Footer toggles this global state when the song ends

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

  // Modal =========================================================

  const [openAddToPlaylistModal, setOpenAddToPlaylistModal] = useState(false)
  const handleOpen = (song: Song) => {
    setOpenAddToPlaylistModal(true)
    setSelectedSong(song) // Assuming you have access to the song object here
  }
  const handleCloseAddToPlaylistModal = () => setOpenAddToPlaylistModal(false)

  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

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
                console.log(localStorage.getItem('likedSongs'))
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
              className="addPlaylistIcon"
              color="white"
              onClick={() => {
                const song = info.row.original
                handleOpen(song)
              }}
            />
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
        // Check if the song is already in the playlist to avoid duplicates
        const songExists = playlist.songs.some(s => s.audioURL === song.audioURL)
        if (!songExists) {
          return { ...playlist, songs: [...playlist.songs, song] }
        }
      }
      return playlist
    })

    setPlaylists(updatedPlaylists)
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists))
  }

  // Render ========================================================
  return (
    <>
      <Modal open={openAddToPlaylistModal} onClose={handleCloseAddToPlaylistModal}>
        <div className="addToPlayListModal">
          <div className="flex" style={{ marginBottom: '1rem' }}>
            <h1>Add to playlist</h1>
            <div className="flexSpacer" />
            <IoIosCloseCircleOutline
              color="white"
              onClick={handleCloseAddToPlaylistModal}
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
