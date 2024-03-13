import React, { useEffect, useRef, useState } from 'react'
import { FaEdit, FaPlusCircle, FaTrash } from 'react-icons/fa'

import uuid4 from 'uuid4'
import './Playlists.scss'

import { useNavigate } from 'react-router'
import { Playlist } from '../../types/interfaces'

const Playlists = () => {
  const navigate = useNavigate()

  // const playlistsStorage = localStorage.getItem('playlists')

  // const testSongs: Song[] = [
  //   {
  //     title: 'Here Comes the Sun',
  //     artist: 'The Beatles',
  //     isPublished: true,
  //     audioURL: hereComesTheSun,
  //     artworkURL: testArtwork,
  //     description: 'A test song',
  //     duration: 180,
  //     token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
  //     outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
  //   },
  //   {
  //     title: 'Zodiac Girls',
  //     artist: 'Black Moth Super Rainbow',
  //     isPublished: true,
  //     audioURL: zodiacGirls,
  //     artworkURL:
  //       'https://i.discogs.com/qRvndWXrCEXL6qXvEAqdr3juNgOxJOgg58mwu85PR1w/rs:fit/g:sm/q:90/h:599/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEyNzg4/MzAtMTIxMDczNzcw/Mi5qcGVn.jpeg',
  //     description: 'A test song',
  //     duration: 180,
  //     token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
  //     outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
  //   }
  // ]

  const [playlists, setPlaylists] = useState(() => {
    const storagePlaylists = localStorage.getItem('playlists')
    return storagePlaylists ? JSON.parse(storagePlaylists) : []
  })

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists))
  }, [playlists])

  const [editingPlaylist, setEditingPlaylist] = useState({ index: -1, text: '' })

  // Confirm delete modal ========================================================

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // Click Outside PLaylist ====================================================================

  const handleClickOutside = (event: MouseEvent) => {
    // Assert event.target as Node to satisfy the type expected by contains method
    const target = event.target as Node

    if (editingInputRef.current && !editingInputRef.current.contains(target)) {
      // If the click is outside the input and the name is empty, remove the playlist
      if (editingPlaylist.text.trim() === '') {
        const updatedPlaylists = playlists.filter(
          (_: any, idx: number) => idx !== editingPlaylist.index
        )
        setPlaylists(updatedPlaylists)
      } else {
        // If there's text, update the playlist name
        updatePlaylistName(editingPlaylist.index, editingPlaylist.text)
      }
      // Reset editing state
      setEditingPlaylist({ index: -1, text: '' })
    }
  }

  useEffect(() => {
    // Only add the listener if we're currently editing a playlist
    if (editingPlaylist.index !== -1) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingPlaylist.index])

  // Handlers ====================================================================

  const handleAddPlaylist = () => {
    const newPlaylist = {
      id: uuid4(),
      name: '',
      songs: [] // Assuming songs is an array of song objects
    }
    // Add the new playlist
    const newPlaylists = [...playlists, newPlaylist]
    setPlaylists(newPlaylists)

    // Set the editing index to the last item in the array (the new playlist)
    setEditingPlaylist({ index: newPlaylists.length - 1, text: '' })
  }

  const updatePlaylistName = (index: number, newName: string) => {
    if (newName.trim() === '') {
      // Remove the playlist if the new name is empty
      const updatedPlaylists = playlists.filter((_: any, idx: number) => idx !== index)
      setPlaylists(updatedPlaylists)
    } else {
      // Update the playlist name if it's not empty
      const updatedPlaylists = playlists.map((playlist: Playlist, idx: number) =>
        idx === index ? { ...playlist, name: newName } : playlist
      )
      setPlaylists(updatedPlaylists)
    }
    // Reset editing state regardless of whether a playlist was updated or removed
    setEditingPlaylist({ index: -1, text: '' })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      updatePlaylistName(index, editingPlaylist.text)
    }
  }

  const handleDelete = (event: React.MouseEvent<SVGElement, MouseEvent>, index: number) => {
    event.stopPropagation()
    const updatedPlaylists = playlists.filter((_: any, idx: number) => idx !== index)
    setPlaylists(updatedPlaylists)
  }

  const editingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if the ref is currently pointing to an input element
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
