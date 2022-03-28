import React from 'react'
import './style.css'
import { NavLink } from 'react-router-dom'

const MainMenu = () => {
  return (
    <div className='mainMenu'>
      <ul>
        <li>
          <NavLink to='/'>Home</NavLink>
        </li>
        <li>
          <a href='#'>Publish a Song</a>
        </li>
        <li>
          <NavLink to='/ArtistProfile'>Artist Profile</NavLink>
        </li>
      </ul>
    </div>
  )
}
export default MainMenu
