import { useState } from 'react'
import './ArtistProfile.scss'
import { Link, useLocation } from 'react-router-dom'
import placeholderArtistImage from '../../assets/Images/placeholder-image.png'
import type { Song } from '../../types/interfaces'

interface LocationState {
  song: Song
}

const ArtistProfile = () => {
  const location = useLocation()
  const { song } = location.state as LocationState

  const [followStatus, setFollowStatus] = useState('Follow')

  return (
    <div className="ArtistProfile">
      <img alt={`Image of ${song.artist}`} src={placeholderArtistImage} />
      <div>
        <h1>{song.artist}</h1>
        <p className="about">{(song as any)?.artist?.bio || 'No artist bio available.'}</p>
        <Link className="button tipBtn" to="#">TIP ARTIST</Link>
        <button className="button" onClick={() => setFollowStatus('Following')}>
          {followStatus}
        </button>
      </div>
    </div>
  )
}

export default ArtistProfile
