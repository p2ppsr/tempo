import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import type { Song } from '../../types/interfaces'
import './MySongs.scss'

import SongList from '../../components/SongList/SongList'
import { CircularProgress } from '@mui/material'
import fetchUserSongs from '../../utils/fetchSongs/fetchUserSongs'

const MySongs = () => {
  const [songs, setSongs] = useState<Song[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const userSongs = await fetchUserSongs()
        setSongs(userSongs ?? [])
      } catch (e) {
        console.error('Failed to fetch user songs:', e)
      }
    })()
  }, [])

  return (
    <div className="container">
      <h1>My Songs</h1>
      <div style={{ marginTop: '1rem' }}>
        {songs.length === 0 ? <CircularProgress /> : <SongList songs={songs} isMySongsOnly />}
      </div>
    </div>
  )
}

export default MySongs
