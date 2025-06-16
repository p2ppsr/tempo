import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
// import './CreatePlaylist.scss'

interface Playlist {
  id: number
  genreId: number
  title: string
}

const CreatePlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [latestId, setLatestId] = useState(0)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlaylistTitle(e.target.value)
  }

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
