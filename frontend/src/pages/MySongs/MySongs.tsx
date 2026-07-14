/**
 * @file MySongs.tsx
 * @description
 * React page component for displaying the songs uploaded by the current user in Tempo.
 * Fetches the user’s songs from the overlay and displays them using the SongList component.
 */

import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import type { Song } from '../../types/interfaces'
import './MySongs.scss'

import SongList from '../../components/SongList/SongList'
import { CircularProgress } from '@mui/material'
import fetchUserSongs from '../../utils/fetchSongs/fetchUserSongs'

/**
 * MySongs Component
 *
 * - Fetches all songs uploaded by the currently authenticated user using `fetchUserSongs`.
 * - Displays a loading spinner while fetching data.
 * - Renders the SongList component with the `isMySongsOnly` flag to show MySongs-specific options (e.g., delete).
 * - If no songs exist, shows only the spinner until data is loaded.
 */
const MySongs = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const userSongs = await fetchUserSongs()
        setSongs(userSongs ?? [])
      } catch (e) {
        console.error('Failed to fetch user songs:', e)
        setError('Connect your Metanet wallet to inspect your published songs.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="container songsPage">
      <h1>My Songs</h1>
      <div className="songsPageContent">
        {loading ? <CircularProgress /> : error ? (
          <div className="emptyPageState" role="alert">{error}</div>
        ) : songs.length === 0 ? (
          <div className="emptyPageState">You have not published any playable songs yet.</div>
        ) : <SongList songs={songs} isMySongsOnly />}
      </div>
    </div>
  )
}

export default MySongs
