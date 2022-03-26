import React from 'react'
import './style.css'
import ProfilePicture from '../../Images/cain.jpg'
import { Link } from 'react-router-dom'

const artistName = 'CAIN'

const ArtistProfile = () => {
  return (
    <div className='ArtistProfile'>
      <img src={ProfilePicture} />
      <div>
        <h1>{artistName}</h1>
        <p className='about'>Cain (stylized in all caps) is a Christian country trio composed of Taylor, Madison, and Logan Cain and signed to Provident Label Group.</p>
        <Link className='button tipBtn' to='/'>TIP ARTIST</Link>
        <Link className='button' to='/'>FOLLOW</Link>
      </div>
    </div>
  )
}
export default ArtistProfile
