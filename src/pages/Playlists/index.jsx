import React, { useState, useEffect } from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import './style.css'
import Playlist from '../../data/playlist'
import { useLocation } from 'react-router-dom'

const Playlists = () => {
  const location = useLocation()
  const { playlist } = location.state
  // const test = location.test
  const [playlists, setPlaylists] = useState([])
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [latestId, setLatestId] = useState(0)
  // const playlists = []
  const handleChange = (e) => {
    setPlaylistTitle(e.target.value)
  }
  console.log(location)
  const handleClick = (e) => {
    setLatestId(latestId + 1)
    setPlaylists(array => [...array, new Playlist(latestId, 0, playlistTitle)])
  }
  useEffect(() => {
    console.log(playlist)
  })

  return (
    <div className='Playlists'>
      <div className='flexBoxContainer'>
        <MainMenu />
        <div className='centerDiv'>
          <form className='publishForm'>
            <label>PLAYLIST NAME: {playlist}</label>
            <input type='text' className='textBox' name='title' placeholder='playlist title' value={playlistTitle} onChange={handleChange} />
            {/* <input type='button' name='submitForm' value='PUBLISH SONG' className='publish' onClick={onFileUpload} /> */}
          </form>
        </div>
        <div className='songTable'>
          <List id='songList' sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {playlists.map((playlist, i) => (
              <ListItem
                key={playlist.id} alignItems='flex-start'
                className='listItem'
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
                <ListItemText button='true' primary={playlist.title} style={{ padding: '0px 20px 0px 0px' }} />
                {/* </Link> */}
              </ListItem>
            ))}
          </List>
          <button className='button' onClick={handleClick}>Create Playlist</button>
        </div>
      </div>
      {/* <div>{playlists.map(playlist =>
          <div>{playlist.id} {playlist.title}</div>
        )}
        </div>
        <button className='button' onClick={handleClick}>Create Playlist</button>
      </div> */}
      <div className='background' />
    </div>
  )
}
export default Playlists
