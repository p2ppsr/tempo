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
          <NavLink to='/PublishASong'>Publish A Song</NavLink>
        </li>
      </ul>
      <div className='slogan'>Feel the beat!</div>
    </div>
  )
}
export default MainMenu
