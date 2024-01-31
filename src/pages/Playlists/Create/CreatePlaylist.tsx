import React, { ChangeEvent, useState } from "react"
// import Playlist from "../../../data/playlist"
import { List, ListItem, ListItemText } from "@mui/material"

class Playlist {
  constructor(
    public id: number,
    public genreId: number,
    public title: string // ... other properties ...
  ) {}
}

const CreatePlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistTitle, setPlaylistTitle] = useState("")
  const [latestId, setLatestId] = useState(0)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlaylistTitle(e.target.value)
  }

  const handleClick = () => {
    setLatestId(latestId + 1)
    setPlaylists((array) => [
      ...array,
      new Playlist(latestId, 0, playlistTitle),
    ])
  }

  return (
    <div className="Playlists">
      <div>
        <div className="centered">
          <form>
            <label>Create New playlist NAME</label>
            <input
              type="text"
              className="textInput"
              name="title"
              placeholder="playlist title"
              value={playlistTitle}
              onChange={handleChange}
            />
            {/* <input type='button' name='submitForm' value='PUBLISH SONG' className='publish' onClick={onFileUpload} /> */}
          </form>
        </div>
        <div className="songTable">
          <List
            id="songList"
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {playlists.map((playlist, i) => (
              <ListItem
                key={playlist.id}
                alignItems="flex-start"
                className="listItem"
              >
                {/* <ListItemText className='songListItem song' primary={i + 1} />
                <img src={albumArtwork} />
                <ListItemText
                  className='song test'
                  button='true'
                  inset
                  primary={song.title}
                  id={i}
                  onClick={changeActive}
                /> */}
                {/* <Link to='/ArtistProfile' state={{ song: song }}> */}
                <ListItemText primary={playlist.id + 1} />
                <ListItemText
                  primary={playlist.title}
                  style={{ padding: "0px 20px 0px 0px" }}
                />
                {/* </Link> */}
              </ListItem>
            ))}
          </List>
          <button className="button" onClick={handleClick}>
            Create Playlist
          </button>
        </div>
      </div>
      {/* <div>{playlists.map(playlist =>
          <div>{playlist.id} {playlist.title}</div>
        )}
        </div>
        <button className='button' onClick={handleClick}>Create Playlist</button>
      </div> */}
      <div className="background" />
    </div>
  )
}
export default CreatePlaylist
