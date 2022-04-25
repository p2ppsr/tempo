import React, { useEffect } from 'react'
import './style.css'
// import { FaUserCircle, FaPlus } from 'react-icons/fa'
// import logo from '../../Images/tempoLogo.png'
import albumArtwork from '../../Images/albumArtwork.jpg'
import musicDemo from '../../Music/song0.mp3'
import ReactAudioPlayer from 'react-audio-player'
// import { NavLink } from 'react-router-dom'

const Footer = () => {
  useEffect(() => {
  }, [])
  return (
    <div className='footer'>
      <img className='logoImage' src={albumArtwork} />
      <p>Artist Name</p>
      <ReactAudioPlayer
        src={musicDemo}
        autoPlay={false}
        controls
        className='playerControls'
        id='audioPlayer'
      />
    </div>
  )
}
export default Footer
