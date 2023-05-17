import React, { useEffect, useContext } from 'react'
import './style.css'
// import { FaUserCircle, FaPlus } from 'react-icons/fa'
// import logo from '../../Images/tempoLogo.png'
import ReactAudioPlayer from 'react-audio-player'
// import { NavLink } from 'react-router-dom'
import { Img } from 'uhrp-react'
import constants from '../../utils/constants'
import artworkContext from '../../artworkContext'

const Footer = () => {
  useEffect(() => {
  }, [])
  const { artworkValue } = useContext(artworkContext)
  return (
    <div className='footer'>
      <Img 
        alt='' 
        id='playerImg' 
        src={artworkValue}
        className='logoImage'
        confederacyHost={constants.confederacyURL}
      />
      <p id='songTitle'> Song Title </p>
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
