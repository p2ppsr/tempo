import React, { useEffect } from 'react'
import './style.css'
// import { FaUserCircle, FaPlus } from 'react-icons/fa'
// import logo from '../../Images/tempoLogo.png'
import ReactAudioPlayer from 'react-audio-player'
// import { NavLink } from 'react-router-dom'

const Footer = () => {
  useEffect(() => {
  }, [])
  return (
    <div className='footer'>
      <img alt='' className='logoImage' src='/Images/albumArtwork.jpg' />
      <p>Artist Name</p>
      <ReactAudioPlayer
        src='/Music/song0.mp3'
        autoPlay={false}
        controls
        className='playerControls'
        id='audioPlayer'
      />
    </div>
  )
}
export default Footer
