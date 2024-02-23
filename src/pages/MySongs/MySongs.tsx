import React, { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Song } from '../../types/interfaces'
import './MySongs.scss'

import SongList from '../../components/SongList/SongList'

// test audio
import { CircularProgress } from '@mui/material'
import useAsyncEffect from 'use-async-effect'
import fetchUserSongs from "../../utils/fetchSongs/fetchUserSongs"

const MySongs = () => {
  const [songs, setSongs] = useState<Song[]>([])

  useAsyncEffect(async () => {
    const userSongs = await fetchUserSongs()
    setSongs(userSongs) // Newest songs on top (note performance with large results)
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
