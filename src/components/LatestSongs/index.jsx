import React, { useRef } from 'react'
import useSwipeScroll from './useSwipeScroll'
import { animated, useSpring } from 'react-spring'
import { useScroll } from 'react-use-gesture'
import './style.css'
import SongsViewer from '../SongsViewer'
import { Link } from 'react-router-dom'

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

const LatestSongs = () => {
  // Drag to scroll
  const ref = useRef(null)
  useSwipeScroll({
    sliderRef: ref
  })

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
        <div className='container' ref={ref} {...bind()}>
          {songArtwork.map(src => (
            <Link key={src} to='/'>
              <animated.div
                key={src}
                className='card'
                style={{
                  ...style,
                  backgroundImage: `url(${src})`
                }}
              />
            </Link>
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
export default LatestSongs
