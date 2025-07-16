/**
 * @file CreatePlaylist.tsx
 * @description
 * React component for creating new playlists. Provides a form for entering a playlist
 * name, displays a list of created playlists with unique IDs, and allows adding
 * new playlists dynamically. Uses MUI's List components for display styling.
 */

import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { List, ListItem, ListItemText } from '@mui/material'

/**
 * Playlist interface defining a playlist's basic properties:
 * - id: unique numeric identifier
 * - genreId: placeholder for future genre assignment
 * - title: playlist name entered by the user
 */
interface Playlist {
  id: number
  genreId: number
  title: string
}

/**
 * CreatePlaylist Component
 *
 * Renders:
 * - An input form for the user to enter a new playlist title
 * - A button to add the playlist to the list (enabled only if the input is not empty)
 * - A dynamic list of created playlists with IDs and titles
 *
 * Uses local React state to manage playlists, playlist title input, and
 * latest assigned ID.
 */
const CreatePlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [latestId, setLatestId] = useState(0)

  /**
   * Handles changes to the playlist title input field.
   * @param e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlaylistTitle(e.target.value)
  }

  /**
   * Handles creation of a new playlist when the button is clicked:
   * - Increments the latest ID
   * - Adds the new playlist to the list with the entered title
   * - Clears the input field
   */
  const handleClick = () => {
    const newId = latestId + 1
    setLatestId(newId)

    setPlaylists((prev) => [
      ...prev,
      {
        id: newId,
        genreId: 0, // Placeholder or dynamic genre ID
        title: playlistTitle.trim(),
      },
    ])

    setPlaylistTitle('')
  }

  return (
    <div className="Playlists">
      <div className="centered">
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="playlist-title">Create New Playlist Name</label>
          <input
            id="playlist-title"
            type="text"
            className="textInput"
            name="title"
            placeholder="Playlist Title"
            value={playlistTitle}
            onChange={handleChange}
          />
        </form>
      </div>

      <div className="songTable">
        <List
          id="songList"
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        >
          {playlists.map((playlist) => (
            <ListItem key={playlist.id} alignItems="flex-start" className="listItem">
              <ListItemText primary={`#${playlist.id}`} />
              <ListItemText
                primary={playlist.title}
                style={{ padding: '0px 20px 0px 0px' }}
              />
            </ListItem>
          ))}
        </List>

        <button
          className="button"
          onClick={handleClick}
          disabled={!playlistTitle.trim()}
        >
          Create Playlist
        </button>
      </div>

      <div className="background" />
    </div>
  )
}

export default CreatePlaylist
