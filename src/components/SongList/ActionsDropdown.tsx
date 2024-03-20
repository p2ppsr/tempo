import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import useOutsideClick from '../../hooks/useOutsideClick'
import { useLikesStore, useModals } from '../../stores/stores'
import { Song } from '../../types/interfaces'
import { copyLinkToClipboard } from '../../utils/copyLinkToClipboard'

interface ActionsDropdownProps {
  info: any
  openAddToPlaylistModal: (song: Song) => void
  onRemoveFromPlaylist?: (songId: string) => void
  isMySongsOnly?: boolean
  openConfirmDeleteModal: (song: Song) => void
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  info,
  openAddToPlaylistModal,
  onRemoveFromPlaylist,
  isMySongsOnly,
  openConfirmDeleteModal
}) => {

  // Dropdown visibility state
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInPlaylistsPage = location.pathname.includes('Playlists')

  // Liked songs ==============================================================

  const [likedSongs, setLikedSongs] = useState<string[]>([])
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedSongs')
    setLikedSongs(storedLikes ? storedLikes.split(',') : [])
  }, [])

  const [likesHasChanged, setLikesHasChanged] = useLikesStore((state: any) => [
    state.likesHasChanged,
    state.setLikedHasChanged
  ])

  const [
    socialShareModalOpen,
    setSocialShareModalOpen,
    setSocialShareLink
  ] = useModals((state: any) => [
    state.socialShareModalOpen,
    state.setSocialShareModalOpen,
    state.setSocialShareLink
  ])

  // Effect to add event listener for clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false) // Close the dropdown if click is outside
      }
    }

    // Always attach the event listener to document, but only take action if dropdownVisible is not null
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownVisible])

  useOutsideClick(dropdownRef, () => setDropdownVisible(false))

  // Check if song is liked or not
  const isLiked = likedSongs.includes(info.row.original.audioURL)

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
                setLikesHasChanged(!likesHasChanged) // Global toggle to trigger likes component reload
                toggleSongLike(info.row.original.audioURL)
                setDropdownVisible(false)
              }}
            >
              {isLiked ? 'Unlike' : 'Like'}
            </div>
            <div
              onClick={() => {
                const song = info.row.original
                openAddToPlaylistModal(song)
                setDropdownVisible(false)
              }}
            >
              Add to Playlist
            </div>
            {isInPlaylistsPage && (
              <div
                onClick={() => {
                  onRemoveFromPlaylist && onRemoveFromPlaylist(info.row.original.audioURL)
                  setDropdownVisible(false)
                }}
              >
                Remove from this playlist
              </div>
            )}
            <div
              onClick={() => {
                copyLinkToClipboard(`${window.location.origin}/Song/${info.row.original.audioURL}`)
                setDropdownVisible(false) // Close the dropdown
              }}
            >
              Copy song link
            </div>
            <div
              onClick={() => {
                setSocialShareLink(`${window.location.origin}/Song/${info.row.original.audioURL}`)
                setSocialShareModalOpen(true)
                setDropdownVisible(false)
              }}
            >
              Share
            </div>
            {isMySongsOnly && (
              <div
                onClick={event => {
                  event.stopPropagation() // Prevent triggering row selection
                  openConfirmDeleteModal(info.row.original)
                  setDropdownVisible(false)
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

export default React.memo(ActionsDropdown);
