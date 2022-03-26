import React from 'react'
import './style.css'
import { Link } from 'react-router-dom'

const MainMenu = () => {
  return (
    <div className='mainMenu'>
      <ul>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <a href='#'>Publish a Song</a>
        </li>
        <li>
          <Link to='/ArtistProfile'>Artist Profile</Link>
        </li>
      </ul>
    </div>
  )
}
export default MainMenu
