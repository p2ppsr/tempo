import React, { useEffect } from 'react'
import './style.css'
import { FaUserCircle, FaPlus } from 'react-icons/fa'
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
  const menuItems = ['Playlist1', 'Playlist2', 'Chill Beats', 'Road Trip Tunes']
  return (
    <div>
      <div className='leftMenu'>
        <div className='logoContainer'>
          <img className='menuLogo' src={logo} />
        </div>
        <div className='welcomeMessage'>
          <p>Welcome!</p>
          <NavLink to='/EditProfile'>
            <FaUserCircle size={30} />
          </NavLink>
        </div>
        <ul>
          <NavLink to='/'>
            <li className='link'>Latest Songs</li>
          </NavLink>
          <NavLink to='/SavedSongs'>
            <li className='link'>Saved Songs</li>
          </NavLink>
          {/* <li className='topLevel'>Playlists</li> */}
          {/* <NavLink
            to='/Playlists'
            state={{
              playlist: 'null',
              action: 'new'
            }}
          >
            <li
              className='childLink'
              style={{
                marginLeft: '10px',
                fontSize: '15px'
              }}
            >Create Playlist
              <FaPlus size={15} style={{ marginLeft: '10px' }} />
            </li>
          </NavLink> */}
          {/* {menuItems.map((item, i) =>
            <NavLink
              to='/Playlists'
              state={{ playlist: item }}
              key={i}
            >
              <li
                style={{
                  marginLeft: '10px',
                  fontSize: '15px'
                }}
                className='childLink'
              >{item}
              </li>
            </NavLink>
          )} */}
        </ul>
      </div>
    </div>
  )
}
export default LeftMenu
