import React, { useState } from 'react'
import './ArtistProfile.scss'
import { Link, useLocation } from 'react-router-dom'
import placeholderArtistImage from '../../assets/Images/placeholder-image.png'

const ArtistProfile = () => {
  const location = useLocation()
  const { song } = location.state

  const [followStatus, setFollowStatus] = useState('Follow')
  return (
    <div className='ArtistProfile'>
      <img alt='artist' src={placeholderArtistImage} />
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
