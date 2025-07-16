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
  const [playlists, setPlaylists] = useState(() => {
    const storagePlaylists = localStorage.getItem('playlists')
    return storagePlaylists ? JSON.parse(storagePlaylists) : []
  })

  // Persist playlists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists))
  }, [playlists])

  const [editingPlaylist, setEditingPlaylist] = useState({ index: -1, text: '' })
  const editingInputRef = useRef<HTMLInputElement>(null)

  // ================ Click Outside Handler =================

  /**
   * Click outside handler to finish editing a playlist name when clicking away.
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (editingInputRef.current && !editingInputRef.current.contains(event.target as Node)) {
      if (editingPlaylist.text.trim()) {
        updatePlaylistName(editingPlaylist.index, editingPlaylist.text)
      } else if (editingPlaylist.index > -1) {
        setPlaylists(playlists.filter((_: any, idx: number) => idx !== editingPlaylist.index))
      }
      setEditingPlaylist({ index: -1, text: '' })
    }
  }

  // Add event listener for click outside when editing a playlist
  useEffect(() => {
    if (editingPlaylist.index !== -1) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [editingPlaylist.index, editingPlaylist.text, playlists])

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
    const updatedPlaylists = playlists.map((playlist: Playlist, idx: number) =>
      idx === index ? { ...playlist, name: newName.trim() } : playlist
    )
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
  const handleDelete = (event: React.MouseEvent<SVGElement, MouseEvent>, index: number) => {
    event.stopPropagation()
    const updatedPlaylists = playlists.filter((_: any, idx: number) => idx !== index)
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
        <div className="flex" style={{ alignItems: 'center' }}>
          <h1>Playlists</h1>
          <FaPlusCircle fill="white" className="newPlayListIcon" onClick={handleAddPlaylist} />
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
                <FaEdit
                  color="white"
                  className="playlistIcon playlistEditIcon"
                  onClick={event => {
                    event.stopPropagation()
                    setEditingPlaylist({ index: index, text: playlist.name })
                  }}
                />
                <FaTrash
                  color="white"
                  className="playlistIcon playlistDeleteIcon"
                  onClick={event => {
                    handleDelete(event, index)
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Playlists
