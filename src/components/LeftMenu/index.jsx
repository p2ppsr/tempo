import React, { useEffect } from 'react'
import './style.css'
import { FaUserCircle } from 'react-icons/fa'
import logo from '../../Images/tempoLogo.png'
import albumArtwork from '../../Images/albumArtwork.jpg'
import musicDemo from '../../Music/song0.mp3'
import ReactAudioPlayer from 'react-audio-player'
import { NavLink } from 'react-router-dom'

const LeftMenu = () => {
  useEffect(() => {
    // Keep track of the active menu item.
    // const allLi = document
    //   .querySelector('.leftMenu ul')
    //   .querySelectorAll('li')
    // function changeMenuActive () {
    //   allLi.forEach((n) => n.classList.remove('active'))
    //   this.classList.add('active')
    // }

    // allLi.forEach(n => n.addEventListener('click', (changeMenuActive)))
  }, [])

  return (
    <div>
      <div className='leftMenu'>
        <div className='logoContainer'>
          <img className='logoImage' src={logo} />
        </div>
        <div className='welcomeMessage'>
          <p>Welcome, John Smith!</p>
          <NavLink to='/EditProfile'>
            <FaUserCircle size={30} />
          </NavLink>
        </div>
        <ul>
          <NavLink to='/'>
            <li>Latest Songs</li>
          </NavLink>
          <NavLink to='/SavedSongs'>
            <li>Saved Songs</li>
          </NavLink>
          <NavLink to='/Playlists'>
            <li>Playlists</li>
          </NavLink>
        </ul>
        <div className='audioPlayer'>
          <img className='logoImage' src={albumArtwork} />
          <p>Artist Name</p>
        </div>
        <div className='footer'>
          <ReactAudioPlayer
            src={musicDemo}
            autoPlay={false}
            controls
            className='playerControls'
            id='audioPlayer'
          />
        </div>
      </div>
    </div>
  )
}
export default LeftMenu
