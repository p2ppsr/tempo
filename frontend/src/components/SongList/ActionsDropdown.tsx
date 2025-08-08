/**
 * @file ActionsDropdown.tsx
 * @description
 * React component providing a dropdown menu of actions for a song item in Tempo.
 * The menu includes options like liking/unliking a song, adding it to a playlist,
 * removing from a playlist, copying its link, sharing, and deleting (if user owns the song).
 */

import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import useOutsideClick from '../../hooks/useOutsideClick'
import { useLikesStore, useModals } from '../../stores/stores'
import type { Song } from '../../types/interfaces'
import { copyLinkToClipboard } from '../../utils/copyLinkToClipboard'

/**
 * Props for the ActionsDropdown component.
 */
interface ActionsDropdownProps {
  /**
   * The table row info including the song object.
   */
  info: { row: { id: string; original: Song } }

  /**
   * Callback to open the Add To Playlist modal.
   */
  openAddToPlaylistModal: (song: Song) => void

  /**
   * Optional callback to remove a song from the current playlist.
   */
  onRemoveFromPlaylist?: (songId: string) => void

  /**
   * Whether the dropdown is shown in "My Songs" mode,
   * which enables the Delete option.
   */
  isMySongsOnly?: boolean

  /**
   * Callback to open the Confirm Delete modal.
   */
  openConfirmDeleteModal: (song: Song) => void
}

/**
 * ActionsDropdown Component
 *
 * - Displays a button (three-dot icon) that toggles a dropdown menu.
 * - The dropdown includes actions:
 *   - Like/Unlike song, updating local storage & likes store
 *   - Add to playlist
 *   - Remove from playlist (if viewing a playlist page)
 *   - Copy song link to clipboard
 *   - Share the song using the SocialShareModal
 *   - Delete the song (if `isMySongsOnly` is true)
 *
 * Features:
 * - Closes automatically on outside click via `useOutsideClick`.
 * - Persists liked songs in localStorage for user session persistence.
 * - Uses Zustand for likes state and modal controls.
 * - Uses React.memo to avoid unnecessary re-renders.
 */
const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  info,
  openAddToPlaylistModal,
  onRemoveFromPlaylist,
  isMySongsOnly,
  openConfirmDeleteModal
}) => {
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isInPlaylistsPage = location.pathname.includes('Playlists')

  // Likes state management
  const [likedSongs, setLikedSongs] = useState<string[]>([])
  useEffect(() => {
    const stored = localStorage.getItem('likedSongs')
    setLikedSongs(stored ? stored.split(',') : [])
  }, [])

  const [likesHasChanged, setLikesHasChanged] = useLikesStore((state) => [
    state.likesHasChanged,
    state.setLikesHasChanged
  ])

  const [_, setSocialShareModalOpen, setSocialShareLink] = useModals((state) => [
    state.socialShareModalOpen,
    state.setSocialShareModalOpen,
    state.setSocialShareLink
  ])

  // Close dropdown on outside click
  useOutsideClick(dropdownRef, () => setDropdownVisible(null))

  const song = info.row.original
  const isLiked = likedSongs.includes(song.songURL)

  /**
   * Toggle song's liked status, updating local state and localStorage.
   */
  const toggleSongLike = () => {
    const updated = isLiked
      ? likedSongs.filter((url) => url !== song.songURL)
      : [...likedSongs, song.songURL]
    setLikedSongs(updated)
    localStorage.setItem('likedSongs', updated.join(','))
    setLikesHasChanged(!likesHasChanged)
  }

  return (
    <div className="actionsContainer flex">
      <button
        className="dropdownToggle"
        onClick={(e) => {
          e.stopPropagation()
          setDropdownVisible(dropdownVisible === info.row.id ? null : info.row.id)
        }}
      >
        <HiOutlineDotsHorizontal style={{ fontSize: '2rem' }} />
      </button>

      {dropdownVisible === info.row.id && (
        <div className="dropdownMenu" ref={dropdownRef}>
          <div onClick={toggleSongLike}>{isLiked ? 'Unlike' : 'Like'}</div>

          <div
            onClick={() => {
              openAddToPlaylistModal(song)
              setDropdownVisible(null)
            }}
          >
            Add to Playlist
          </div>

          {isInPlaylistsPage && (
            <div
              onClick={() => {
                onRemoveFromPlaylist?.(song.songURL)
                setDropdownVisible(null)
              }}
            >
              Remove from this playlist
            </div>
          )}

          <div
            onClick={() => {
              const url = `${window.location.origin}/Song/${song.songURL}`
              copyLinkToClipboard(url)
              console.log('copied song:', song, url)
              setDropdownVisible(null)
            }}
          >
            Copy song link
          </div>

          <div
            onClick={() => {
              setSocialShareLink(`${window.location.origin}/Song/${song.songURL}`)
              setSocialShareModalOpen(true)
              setDropdownVisible(null)
            }}
          >
            Share
          </div>

          {isMySongsOnly && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                openConfirmDeleteModal(song)
                setDropdownVisible(null)
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

export default React.memo(ActionsDropdown)
