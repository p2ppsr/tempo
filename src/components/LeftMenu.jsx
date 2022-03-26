import React, { useEffect } from 'react'
import '../styles/leftMenu.css'
import { FaUserCircle } from 'react-icons/fa'
import logo from '../Images/tempoLogo.png'
import albumArtwork from '../Images/albumArtwork.jpg'
import musicDemo from '../Music/audioDemo.mp3'
import ReactAudioPlayer from 'react-audio-player'

const LeftMenu = () => {
  useEffect(() => {
    // Keep track of the active menu item.
    const allLi = document
      .querySelector('.leftMenu ul')
      .querySelectorAll('li')
    function changeMenuActive () {
      allLi.forEach((n) => n.classList.remove('active'))
      this.classList.add('active')
    }

    allLi.forEach(n => n.addEventListener('click', (changeMenuActive)))
  }, [])

  return (
    <div>
      <div className='leftMenu'>
        <div className='logoContainer'>
          <img className='logoImage' src={logo} />
        </div>
        <div className='welcomeMessage'>
          <p>Welcome, John Smith!</p>
          <a href='#'>
            <FaUserCircle size={30} />
          </a>
        </div>
        <ul>
          <li>
            <a href='#'>Latest Songs</a>
          </li>
          <li>
            <a href='#'>Saved Songs</a>
          </li>
          <li>
            <a href='#'>Playlists</a>
          </li>
        </ul>
        <div className='audioPlayer'>
          <img className='logoImage' src={albumArtwork} />
          <p>Artist Name</p>
          <ReactAudioPlayer
            src={musicDemo}
            autoPlay
            controls
            className='playerControls'
          />
        </div>
      </div>
    </div>
  )
}
export default LeftMenu
