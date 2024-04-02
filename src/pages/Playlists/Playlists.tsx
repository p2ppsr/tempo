import React, { useEffect, useRef, useState } from 'react'
import uuid4 from 'uuid4'
import { useNavigate } from 'react-router-dom'
import { Playlist } from '../../types/interfaces'
import { FaEdit, FaPlusCircle, FaTrash } from 'react-icons/fa'
import './Playlists.scss'

const Playlists = () => {
  const navigate = useNavigate()

  const [playlists, setPlaylists] = useState(() => {
    const storagePlaylists = localStorage.getItem('playlists')
    return storagePlaylists ? JSON.parse(storagePlaylists) : []
  })

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists))
  }, [playlists])

  const [editingPlaylist, setEditingPlaylist] = useState({ index: -1, text: '' })
  const editingInputRef = useRef<HTMLInputElement>(null)

  // Click Outside PLaylist ====================================================================

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

  useEffect(() => {
    if (editingPlaylist.index !== -1) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [editingPlaylist.index, editingPlaylist.text, playlists])

  // Handlers ====================================================================

  const handleAddPlaylist = () => {
    const newPlaylist = {
      id: uuid4(),
      name: '',
      songs: []
    }
    setPlaylists([...playlists, newPlaylist])
    setEditingPlaylist({ index: playlists.length, text: '' })
  }

  const updatePlaylistName = (index: number, newName: string) => {
    const updatedPlaylists = playlists.map((playlist: Playlist, idx: number) =>
      idx === index ? { ...playlist, name: newName.trim() } : playlist
    )
    setPlaylists(updatedPlaylists)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      updatePlaylistName(index, editingPlaylist.text)
      setEditingPlaylist({ index: -1, text: '' })
    }
  }

  const handleDelete = (event: React.MouseEvent<SVGElement, MouseEvent>, index: number) => {
    event.stopPropagation()
    const updatedPlaylists = playlists.filter((_: any, idx: number) => idx !== index)
    setPlaylists(updatedPlaylists)
  }

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
