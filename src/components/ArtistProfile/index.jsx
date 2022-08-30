import React, { useState } from 'react'
import './style.css'
import ProfilePicture from '../../Images/placeholder-image.png'
import { Link, useLocation } from 'react-router-dom'

const ArtistProfile = () => {
  const location = useLocation()
  const { song } = location.state
  console.log('song ' + song)

  const [followStatus, setFollowStatus] = useState('Follow')
  return (
    <div className='ArtistProfile'>
      <img alt='artist' src={ProfilePicture} />
      <div>
        <h1>{song.artist.name}</h1>
        <p className='about'>{song.artist.bio}</p>
        <Link className='button tipBtn' to='#'>TIP ARTIST</Link>
        <button className='button' onClick={() => setFollowStatus('Following')}>{followStatus}</button>
      </div>
    </div>
  )
}
export default ArtistProfile
