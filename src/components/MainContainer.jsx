import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import '../styles/mainContainer.css'
import albumArtwork from '../Images/albumArtwork.jpg'
import { render } from 'react-dom'
import { animated, useSpring } from 'react-spring'
import { useScroll } from 'react-use-gesture'

const clamp = (value, clampAt = 30) => {
  if (value > 0) {
    return value > clampAt ? clampAt : value
  } else {
    return value < -clampAt ? -clampAt : value
  }
}

const songArtwork = [
  '/AlbumArtwork/beatles.jpg',
  '/AlbumArtwork/albumArtwork.jpg',
  '/AlbumArtwork/hollowCoves.jpg',
  '/AlbumArtwork/hollowCoves.jpg',
  '/AlbumArtwork/hollowCoves.jpg',
  '/AlbumArtwork/albumArtwork.jpg',
  '/AlbumArtwork/albumArtwork.jpg'
]

const MainContainer = () => {
  // Testing out a horizontal scroll bar animation.
  const [style, set] = useSpring(() => ({
    transform: 'perspective(500px) rotateY(0deg)'
  }))
  const bind = useScroll(event => {
    set({
      transform: `perspective(500px) rotateY(${
            event.scrolling ? clamp(event.delta[0]) : 0
          }deg)`
    })
  })

  // TODO: Refactor a lot of this code to make it extensible, clean, and reliable.
  const filteredSongs = [{
    title: 'Talkin\' Tennessee',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:45'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  }]
  return (
    <div className='mainContainer'>
      <div className='horizontallScroller'>
        <div className='container' {...bind()}>
          {songArtwork.map(src => (
            <animated.div
              key={src}
              className='card'
              style={{
                ...style,
                backgroundImage: `url(${src})`
              }}
            />
          ))}
        </div>
      </div>
      <div className='tableHeader'>
        <h3>New Releases</h3>
      </div>
      <div className='songTable'>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {filteredSongs.map((song, i) => (
            <ListItem button alignItems='flex-start'>
              <ListItemText className='songListItem' primary={i + 1} />
              <img src={albumArtwork} />
              <ListItemText inset primary={song.title} />
              <ListItemText primary={song.artist} />
              <ListItemText primary={song.length} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
export default MainContainer
