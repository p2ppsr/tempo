/**
 * @file ActionsDropdown.tsx
 * @description
 * React component providing a dropdown menu of actions for a song item in Tempo.
 * The menu includes options like liking/unliking a song, adding it to a playlist,
 * removing from a playlist, copying its link, sharing, and deleting (if user owns the song).
 */

import React, { useRef, useState } from 'react'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { useLocation } from 'react-router-dom'
import useOutsideClick from '../../hooks/useOutsideClick'
import { useModals } from '../../stores/stores'
import { useLibraryStore } from '../../stores/libraryStore'
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
 *   - Like/Unlike song, updating the wallet-backed library store
 *   - Add to playlist
 *   - Remove from playlist (if viewing a playlist page)
 *   - Copy song link to clipboard
 *   - Share the song using the SocialShareModal
 *   - Delete the song (if `isMySongsOnly` is true)
 *
 * Features:
 * - Closes automatically on outside click via `useOutsideClick`.
 * - Persists liked songs in the wallet with a local offline cache.
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
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentLocation = useLocation()

  const isInPlaylistsPage = currentLocation.pathname.includes('Playlists')

  const likedSongIds = useLibraryStore(state => state.likedSongIds)
  const toggleSongLike = useLibraryStore(state => state.toggleSongLike)
  const initializeLibrary = useLibraryStore(state => state.initializeLibrary)

  const [, setSocialShareModalOpen, setSocialShareLink] = useModals((state) => [
    state.socialShareModalOpen,
    state.setSocialShareModalOpen,
    state.setSocialShareLink
  ])

  // Close dropdown on outside click
  useOutsideClick(dropdownRef, () => setDropdownVisible(null))

  const song = info.row.original
  const isLiked = likedSongIds.includes(song.songURL)

  return (
    <div className="actionsContainer flex">
      <button
        type="button"
        className="dropdownToggle"
        aria-label={`Actions for ${song.title}`}
        aria-expanded={dropdownVisible === info.row.id}
        onClick={(e) => {
          e.stopPropagation()
          const opening = dropdownVisible !== info.row.id
          setDropdownVisible(opening ? info.row.id : null)
          if (opening) void initializeLibrary()
        }}
      >
        <HiOutlineDotsHorizontal style={{ fontSize: '2rem' }} />
      </button>

      {dropdownVisible === info.row.id && (
        <div className="dropdownMenu" role="menu" ref={dropdownRef} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            role="menuitem"
            disabled={isUpdatingLike}
            aria-busy={isUpdatingLike}
            onClick={() => {
              setIsUpdatingLike(true)
              void toggleSongLike(song.songURL).finally(() => setIsUpdatingLike(false))
            }}
          >
            {isLiked ? 'Unlike' : 'Like'}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              openAddToPlaylistModal(song)
              setDropdownVisible(null)
            }}
          >
            Add to Playlist
          </button>

          {isInPlaylistsPage && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onRemoveFromPlaylist?.(song.songURL)
                setDropdownVisible(null)
              }}
            >
              Remove from this playlist
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const url = `${window.location.origin}/Song/${song.songURL}`
              copyLinkToClipboard(url)
              console.log('copied song:', song, url)
              setDropdownVisible(null)
            }}
          >
            Copy song link
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setSocialShareLink(`${window.location.origin}/Song/${song.songURL}`)
              setSocialShareModalOpen(true)
              setDropdownVisible(null)
            }}
          >
            Share
          </button>

          {isMySongsOnly && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                openConfirmDeleteModal(song)
                setDropdownVisible(null)
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(ActionsDropdown)
