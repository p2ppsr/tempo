import React, { useState } from 'react'
import './style.css'
import { Link, useLocation } from 'react-router-dom'

const ArtistProfile = () => {
  const location = useLocation()
  const { song } = location.state

  const [followStatus, setFollowStatus] = useState('Follow')
  return (
    <div className='ArtistProfile'>
      <img alt='artist' src='/Images/placeholder-image.png' />
      <div>
        <h1>{song.artist}</h1>
        <p className='about'>{song.artist.bio}</p>
        <Link className='button tipBtn' to='#'>TIP ARTIST</Link>
        <button className='button' onClick={() => setFollowStatus('Following')}>{followStatus}</button>
      </div>
    </div>
  )
}
export default ArtistProfile
