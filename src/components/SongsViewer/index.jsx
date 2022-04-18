import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import albumArtwork from '../../Images/albumArtwork.jpg'
import './style.css'
import parapetMock from '../../data/songs'
import musicDemo from '../../Music/song0.mp3'

const songURLS = [
  'https://www.zapsplat.com/wp-content/uploads/2015/music-one/jes_smith_music_fast_country_pickin.mp3',
  'https://www.zapsplat.com/wp-content/uploads/2015/music-one/music_zapsplat_droplets_of_dew.mp3'
]

const SongsViewer = () => {
  // Mock querying a bridge using parapet
  const songs = parapetMock()
  return (
    <div>
      <div className='songTable'>
        <List id='songList' sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {songs.map((song, i) => (
            <ListItem
              key={song} button alignItems='flex-start' onClick={() => {
                // Start playing the selected song.
                for (let j = 0; j < songs.length; j++) {
                  const listItem = document.getElementById('song' + j)
                  listItem.style.color = 'white'
                }
                const selectedSong = document.getElementById('song' + i)
                selectedSong.style.color = '#7F54FF'

                // TODO: Send an action which retrieves an unlock token for the specified song?
                const audioPlayer = document.getElementById('audioPlayer')
                audioPlayer.src = songURLS[i]
                audioPlayer.autoplay = true
              }}
            >
              <ListItemText className='songListItem' primary={i + 1} />
              <img src={albumArtwork} />
              <ListItemText inset primary={song.title} id={'song' + i} />
              <Link to='/ArtistProfile' state={{ song: song }}>
                <ListItemText primary={song.artist.name} style={{ padding: '0px 20px 0px 0px' }} />
              </Link>
              <ListItemText primary={song.length} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
export default SongsViewer
