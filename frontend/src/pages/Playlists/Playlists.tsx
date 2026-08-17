/**
 * @file Playlists.tsx
 * @description
 * React component for managing user-created playlists. Allows users to:
 * - View all playlists saved in localStorage
 * - Create new playlists
 * - Edit playlist names inline
 * - Delete playlists
 * - Navigate to individual playlist detail pages.
 * Updates to playlists are persisted in localStorage.
 */

import React, { useEffect, useRef, useState } from 'react'
import uuid4 from 'uuid4'
import { useNavigate } from 'react-router-dom'
import type { Playlist } from '../../types/interfaces'
import { FaEdit, FaPlusCircle, FaTrash } from 'react-icons/fa'
import './Playlists.scss'
import { useLibraryStore } from '../../stores/libraryStore'

/**
 * Playlists Component
 *
 * Manages playlist CRUD operations:
 * - Displays playlists fetched from localStorage on mount.
 * - Allows creating new playlists with unique IDs.
 * - Provides inline editing of playlist names with auto-save on blur or Enter.
 * - Deletes playlists and updates localStorage accordingly.
 * - Navigates to playlist detail pages via React Router.
 */
const Playlists = () => {
  const navigate = useNavigate()

  // ================ State Management =================
  const playlists = useLibraryStore(state => state.playlists)
  const setPlaylists = useLibraryStore(state => state.setPlaylists)

  const [editingPlaylist, setEditingPlaylist] = useState({ index: -1, text: '' })
  const editingInputRef = useRef<HTMLInputElement>(null)

  // ================ Click Outside Handler =================

  // Add event listener for click outside when editing a playlist
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!editingInputRef.current || editingInputRef.current.contains(event.target as Node)) return

      const { index, text } = editingPlaylist
      setPlaylists(text.trim()
        ? playlists.map((playlist, idx) => idx === index ? { ...playlist, name: text.trim() } : playlist)
        : playlists.filter((_, idx) => idx !== index))
      setEditingPlaylist({ index: -1, text: '' })
    }

    if (editingPlaylist.index !== -1) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [editingPlaylist, playlists, setPlaylists])

  // ================ Playlist Handlers =================

  /**
   * Adds a new empty playlist and enters editing mode on it.
   */
  const handleAddPlaylist = () => {
    const newPlaylist = {
      id: uuid4(),
      name: '',
      songs: []
    }
    setPlaylists([...playlists, newPlaylist])
    setEditingPlaylist({ index: playlists.length, text: '' })
  }

  /**
   * Updates the name of the playlist at the given index.
   * @param index - Index of playlist in the array
   * @param newName - New name to set
   */
  const updatePlaylistName = (index: number, newName: string) => {
    const trimmedName = newName.trim()
    const updatedPlaylists = trimmedName
      ? playlists.map((playlist: Playlist, idx: number) =>
        idx === index ? { ...playlist, name: trimmedName } : playlist
      )
      : playlists.filter((_, idx) => idx !== index)
    setPlaylists(updatedPlaylists)
  }

  /**
   * Handles saving changes to a playlist name on Enter key press.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      updatePlaylistName(index, editingPlaylist.text)
      setEditingPlaylist({ index: -1, text: '' })
    }
  }

  /**
   * Deletes the playlist at the given index.
   * @param event - Mouse event to stop propagation
   * @param index - Index of playlist to delete
   */
  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.stopPropagation()
    const updatedPlaylists = playlists.filter((_, idx) => idx !== index)
    setPlaylists(updatedPlaylists)
  }

  /**
   * Handles navigation to the playlist detail page.
   * @param id - Playlist ID to navigate to
   */
  useEffect(() => {
    if (editingInputRef.current) {
      editingInputRef.current.focus()
    }
  }, [editingPlaylist.index])

  return (
    <>
      <div className="container">
        <div className="playlistHeadingRow">
          <h1>Playlists</h1>
          <button className="newPlayListButton" onClick={handleAddPlaylist} aria-label="Create playlist">
            <FaPlusCircle className="newPlayListIcon" />
            New Playlist
          </button>
        </div>

        <div className="playlistsContainer">
          {playlists.map((playlist: Playlist, index: number) => {
            return (
              <div
                className="playlist flex"
                key={playlist.id}
                onClick={() => {
                  navigate(playlist.id)
                }}
              >
                {editingPlaylist.index === index ? (
                  <input
                    ref={editingPlaylist.index === index ? editingInputRef : null}
                    className="editingPlaylistInput"
                    value={editingPlaylist.text}
                    onChange={e => setEditingPlaylist({ ...editingPlaylist, text: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, index)}
                  />
                ) : (
                  <p>{playlist.name}</p>
                )}
                <div className="flexSpacer" />
                <button
                  type="button"
                  className="playlistAction playlistEditAction"
                  aria-label={`Edit ${playlist.name || 'playlist'}`}
                  onClick={event => {
                    event.stopPropagation()
                    setEditingPlaylist({ index: index, text: playlist.name })
                  }}
                >
                  <FaEdit className="playlistIcon" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="playlistAction playlistDeleteAction"
                  aria-label={`Delete ${playlist.name || 'playlist'}`}
                  onClick={event => {
                    handleDelete(event, index)
                  }}
                >
                  <FaTrash className="playlistIcon" aria-hidden="true" />
                </button>
              </div>
            )
          })}
          {playlists.length === 0 && (
            <div className="playlistEmptyState">
              <p>No playlists yet. Create one to organize your songs.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Playlists
