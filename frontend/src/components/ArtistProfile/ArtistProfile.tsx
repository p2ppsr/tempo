/**
 * @file ArtistProfile.tsx
 * @description
 * React component for displaying an artist’s profile in Tempo.
 * Shows artist name, placeholder image, optional bio, and provides
 * actions to tip or follow the artist.
 */

import { useState } from 'react'
import './ArtistProfile.scss'
import { Link, useLocation } from 'react-router-dom'
import placeholderArtistImage from '../../assets/Images/placeholder-image.png'
import type { Song } from '../../types/interfaces'

/**
 * Type definition for the state passed through React Router’s location,
 * expected to contain a Song object.
 */
interface LocationState {
  song: Song
}

/**
 * ArtistProfile Component
 *
 * Displays a profile page for the artist of a given song, including:
 * - Artist name
 * - Placeholder artist image
 * - Optional artist bio (if available on the song object)
 * - TIP ARTIST link (currently non-functional placeholder)
 * - Follow button with stateful status text
 *
 * Relies on React Router's `useLocation` to receive the `song` object
 * from the previous page navigation.
 */
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
