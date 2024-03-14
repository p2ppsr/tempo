import React, { useState } from 'react'
import SongList from '../../components/SongList/SongList'
import useAsyncEffect from 'use-async-effect'
import fetchSongs from '../../utils/fetchSongs/fetchSongs'
import { SearchFilter, Song } from '../../types/interfaces'
import { CircularProgress } from '@mui/material'
import { useLikesStore } from "../../stores/stores"

const Likes = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const [likesHasChanged, setLikesHasChanges] = useLikesStore((state: any) => [
    state.likesHasChanged,
    state.setLikesHasChanges
  ])

  useAsyncEffect(async () => {
    const likedSongs = localStorage.getItem('likedSongs')
    let likedSongsArray = likedSongs?.split(',')

    const searchFilter: SearchFilter = {
      findAll: true,
      artistIdentityKey: '',
      songIDs: likedSongsArray?.map((likedSong: string) =>
        Buffer.from(likedSong).toString('base64')
      )
    }

    try {
      // Get a list of song objects
      const res = await fetchSongs(searchFilter)
      setIsLoaded(true)

      setSongs(res.reverse()) // Newest songs on top (note performance with large results)
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      } else {
        // Handle cases where the caught object is not an Error instance
        console.log('An unexpected error occurred:', e)
      }
    }
  }, [likesHasChanged])

  return (
    <>
      <div className="container">
        <h1>Likes</h1>
        {songs.length === 0 && !isLoaded && (
          <>
            <CircularProgress style={{ marginTop: '1rem' }} />
          </>
        )}
        {songs.length !== 0 && isLoaded && (
          <>
            <div style={{ marginTop: '1rem' }}>
              <SongList songs={songs} />
            </div>
          </>
        )}
        {songs.length === 0 && isLoaded && (
          <>
            <p style={{ marginTop: '1rem' }}>No songs have been liked yet.</p>
          </>
        )}
      </div>
    </>
  )
}

export default Likes
