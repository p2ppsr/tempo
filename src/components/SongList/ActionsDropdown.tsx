import React, { useEffect, useRef, useState } from 'react'
import useOutsideClick from '../../hooks/useOutsideClick'
import { Song } from '../../types/interfaces'
import { Cell, CellContext } from '@tanstack/react-table'
import { toast } from 'react-toastify'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'

interface ActionsDropdownProps {
  info: CellContext<Song, any>; // Adjusted to expect CellContext
  openAddToPlaylistModal: (song: Song) => void;
  onRemoveFromPlaylist?: (songId: string) => void;
  isMySongsOnly?: boolean;
  openConfirmDeleteModal: (song: Song) => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  info,
  openAddToPlaylistModal,
  onRemoveFromPlaylist,
  isMySongsOnly,
  openConfirmDeleteModal
}) => {
  const isInPlaylistsPage = location.pathname.includes('Playlists')

  // Liked songs ==============================================================

  const [likedSongs, setLikedSongs] = useState<string[]>([])
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedSongs')
    setLikedSongs(storedLikes ? storedLikes.split(',') : [])
  }, [])

  // Selected Song object
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

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

  useOutsideClick(dropdownRef, () => setDropdownVisible(null))

  // Check if song is liked or not
  const isLiked = likedSongs.includes(info.row.original.audioURL)

  const copyLinkToClipboard = (audioURL: string) => {
    // Use window.location.origin to dynamically get the base URL
    const link = `${window.location.origin}/Song/${audioURL}`
    navigator.clipboard.writeText(link).then(
      () => {
        toast.success('Song link copied to clipboard')
      },
      e => {
        console.error('Failed to copy link. Error: ', e)
        toast.error('Failed to copy link. Error: ', e)
      }
    )
  }

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

  return (
    <>
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
            <div
              onClick={() => {
                copyLinkToClipboard(info.row.original.audioURL)
                setDropdownVisible(null) // Close the dropdown
              }}
            >
              Copy song link
            </div>
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
    </>
  )
}

export default ActionsDropdown
