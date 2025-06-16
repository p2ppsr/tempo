import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import useOutsideClick from '../../hooks/useOutsideClick'
import { useLikesStore, useModals } from '../../stores/stores'
import type { Song } from '../../types/interfaces'
import { copyLinkToClipboard } from '../../utils/copyLinkToClipboard'

interface ActionsDropdownProps {
  info: { row: { id: string; original: Song } }
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
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isInPlaylistsPage = location.pathname.includes('Playlists')

  // Likes state
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

  // Auto-close on outside click
  useOutsideClick(dropdownRef, () => setDropdownVisible(null))

  const song = info.row.original
  const isLiked = likedSongs.includes(song.songURL)

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
