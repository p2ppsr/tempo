import React, { useState, useEffect } from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import albumArtwork from '../../Images/albumArtwork.jpg'
import './style.css'
import parapetMock from '../../data/songs'
import musicDemo from '../../Music/song0.mp3'
import parapet from 'parapet-js'

const songURLS = [
  'https://www.zapsplat.com/wp-content/uploads/2015/music-one/jes_smith_music_fast_country_pickin.mp3',
  'https://www.zapsplat.com/wp-content/uploads/2015/music-one/music_zapsplat_droplets_of_dew.mp3'
]

const SongsViewer = () => {
  const [songStatus, setSongStatus] = useState('red')
  const [songs, setSongs] = useState([])
  const changeActive = (e) => {
    const allSongs = document.querySelectorAll('.song')
    allSongs.forEach((n) => n.parentNode.classList.remove('isActive'))
    console.log('hmm' + allSongs[0])
    e.currentTarget.parentNode.classList.add('isActive')

    const audioPlayer = document.getElementById('audioPlayer')
    audioPlayer.src = songURLS[e.currentTarget.id]
    audioPlayer.autoplay = true
  }

  const fetchSongs = async () => {
    // Query tempo bridge
    const availableSongs = await parapet({
      resolvers: ['http://localhost:3103'],
      bridge: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', // TSP
      request: {
        type: 'json-query',
        query: {
          v: 3,
          q: {
            collection: 'songs',
            find: {}
          }
        }
      }
    })
    return availableSongs
  }

  useEffect(() => {
    fetchSongs()
      .then((res) => {
        setSongs(res)
      })
      .catch((e) => {
        console.log(e.message)
      })
  }, [songs])

  // Mock querying a bridge using parapet
  // const songs = parapetMock()

  return (
    <div>
      <div className='songTable'>
        <List id='songList' sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {songs.map((song, i) => (
            <ListItem
              key={song.id} alignItems='flex-start'
              className='listItem'
            >
              <ListItemText className='songListItem song' primary={i + 1} />
              <img src={albumArtwork} />
              <ListItemText
                className='song test'
                button='true'
                inset
                primary={song.title}
                id={i}
                onClick={changeActive}
              />
              <Link to='/ArtistProfile' state={{ song: song }}>
                <ListItemText button='true' primary={song.artist} style={{ padding: '0px 20px 0px 0px' }} />
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
