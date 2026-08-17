import { useEffect, useMemo, useRef, useState } from 'react'
import uuid4 from 'uuid4'
import { useNavigate } from 'react-router-dom'
import type { Playlist } from '../../types/interfaces'
import { FaEdit, FaPlusCircle, FaTrash } from 'react-icons/fa'
import LibrarySyncStatus from '../../components/LibrarySyncStatus/LibrarySyncStatus'
import { useLibraryStore } from '../../stores/libraryStore'
import './Playlists.scss'

interface EditingPlaylist {
  id: string
  text: string
  isNew: boolean
}

const Playlists = () => {
  const navigate = useNavigate()
  const playlists = useLibraryStore(state => state.playlists)
  const initializeLibrary = useLibraryStore(state => state.initializeLibrary)
  const createPlaylist = useLibraryStore(state => state.createPlaylist)
  const renamePlaylist = useLibraryStore(state => state.renamePlaylist)
  const deletePlaylist = useLibraryStore(state => state.deletePlaylist)
  const [editingPlaylist, setEditingPlaylist] = useState<EditingPlaylist | null>(null)
  const editingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void initializeLibrary()
  }, [initializeLibrary])

  useEffect(() => {
    editingInputRef.current?.focus()
  }, [editingPlaylist?.id])

  const visiblePlaylists = useMemo<Playlist[]>(() => {
    if (!editingPlaylist?.isNew) return playlists
    return [...playlists, { id: editingPlaylist.id, name: '', songs: [] }]
  }, [editingPlaylist, playlists])

  const startNewPlaylist = () => {
    if (editingPlaylist?.isNew) {
      editingInputRef.current?.focus()
      return
    }
    setEditingPlaylist({ id: uuid4(), text: '', isNew: true })
  }

  const saveEditingPlaylist = async () => {
    if (!editingPlaylist) return
    const name = editingPlaylist.text.trim()
    const { id, isNew } = editingPlaylist
    setEditingPlaylist(null)
    if (!name) return
    if (isNew) await createPlaylist(id, name)
    else await renamePlaylist(id, name)
  }

  return (
    <div className="container">
      <div className="playlistHeadingRow">
        <h1>Playlists</h1>
        <button className="newPlayListButton" onClick={startNewPlaylist} aria-label="Create playlist">
          <FaPlusCircle className="newPlayListIcon" />
          New Playlist
        </button>
      </div>

      <LibrarySyncStatus />

      <div className="playlistsContainer">
        {visiblePlaylists.map((playlist: Playlist) => {
          const isEditing = editingPlaylist?.id === playlist.id
          return (
            <div
              className="playlist flex"
              key={playlist.id}
              onClick={() => {
                if (!isEditing) navigate(playlist.id)
              }}
            >
              {isEditing ? (
                <input
                  ref={editingInputRef}
                  className="editingPlaylistInput"
                  aria-label="Playlist name"
                  placeholder="Name your playlist"
                  value={editingPlaylist.text}
                  onClick={event => event.stopPropagation()}
                  onChange={event => setEditingPlaylist({ ...editingPlaylist, text: event.target.value })}
                  onBlur={() => void saveEditingPlaylist()}
                  onKeyDown={event => {
                    if (event.key === 'Enter') void saveEditingPlaylist()
                    if (event.key === 'Escape') setEditingPlaylist(null)
                  }}
                />
              ) : (
                <p>{playlist.name}</p>
              )}
              <div className="flexSpacer" />
              {!isEditing && (
                <>
                  <button
                    type="button"
                    className="playlistAction playlistEditAction"
                    aria-label={`Edit ${playlist.name}`}
                    onClick={event => {
                      event.stopPropagation()
                      setEditingPlaylist({ id: playlist.id, text: playlist.name, isNew: false })
                    }}
                  >
                    <FaEdit className="playlistIcon" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="playlistAction playlistDeleteAction"
                    aria-label={`Delete ${playlist.name}`}
                    onClick={event => {
                      event.stopPropagation()
                      void deletePlaylist(playlist.id)
                    }}
                  >
                    <FaTrash className="playlistIcon" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          )
        })}
        {visiblePlaylists.length === 0 && (
          <div className="playlistEmptyState">
            <p>No playlists yet. Create one to organize your songs.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Playlists
