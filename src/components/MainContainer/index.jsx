import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { render } from 'react-dom'
import { animated, useSpring } from 'react-spring'
import { useScroll } from 'react-use-gesture'
import './style.css'
import SongsViewer from '../SongsViewer'

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
      <SongsViewer />
    </div>
  )
}
export default MainContainer
