import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import albumArtwork from '../../Images/albumArtwork.jpg'
import './style.css'
import songs from '../../data/songs'
import musicDemo from '../../Music/song0.mp3'
import { withRouter } from 'react-router-dom'

const songURLS = [
  'https://www.zapsplat.com/wp-content/uploads/2015/music-one/music_david_gwyn_jones_looking_back_over_the_hill_instrumental.mp3',
  'https://www.zapsplat.com/wp-content/uploads/2015/music-one/music_zapsplat_droplets_of_dew.mp3'
]

const SongsViewer = () => {
  // TODO: Refactor a lot of this code to make it extensible, clean, and reliable.

  return (
    <div>
      <div className='songTable'>
        <List id='songList' sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {songs.map((song, i) => (
            <ListItem key={song} button alignItems='flex-start' onClick={() => {
              // Start playing the selected song.
              for (let j = 0; j < songs.length; j++) {
                const listItem = document.getElementById('song' + j)
                listItem.style.color = 'white'
              }
              const selectedSong = document.getElementById('song' + i)
              selectedSong.style.color = '#7F54FF'

              const audioPlayer = document.getElementById('audioPlayer')
              audioPlayer.src = songURLS[i]
              audioPlayer.autoplay = true
            }}>
              <ListItemText className='songListItem' primary={i + 1} />
              <img src={albumArtwork} />
              <ListItemText inset primary={song.title} id={'song' + i} />
              <Link to='/ArtistProfile' state={{ song: song }}>
                <ListItemText primary={song.artist.name} />
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
