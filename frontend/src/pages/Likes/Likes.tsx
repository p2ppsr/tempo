import { useState, useEffect } from 'react'
import { CircularProgress } from '@mui/material'
import SongList from '../../components/SongList/SongList'
import fetchSongs from '../../utils/fetchSongs/fetchSongs'
import { useLikesStore } from '../../stores/stores'
import type { Song } from '../../types/interfaces'
import { Utils } from '@bsv/sdk'
import type { FindAllQuery } from '../../types/interfaces.js'

const Likes = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const [likesHasChanged] = useLikesStore((state: any) => [
    state.likesHasChanged
  ])

  useEffect(() => {
    const fetchLikedSongs = async () => {
      const likedSongs = localStorage.getItem('likedSongs')
      const likedSongsArray = likedSongs?.split(',') ?? []

      const query: FindAllQuery = {
        type: 'findAll',
        value: {
          songIDs: likedSongsArray.map((likedSong: string) =>
            Utils.toBase64(Utils.toArray(likedSong, 'utf8'))
          )
        }
      }

      try {
        const res = await fetchSongs(query)
        setSongs(res.reverse())
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message)
        } else {
          console.error('An unexpected error occurred:', e)
        }
      } finally {
        setIsLoaded(true)
      }
    }

    fetchLikedSongs()
  }, [likesHasChanged])

  return (
    <div className="container">
      <h1>Likes</h1>
      {!isLoaded && songs.length === 0 && (
        <CircularProgress style={{ marginTop: '1rem' }} />
      )}
      {isLoaded && songs.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <SongList songs={songs} />
        </div>
      )}
      {isLoaded && songs.length === 0 && (
        <p style={{ marginTop: '1rem' }}>No songs have been liked yet.</p>
      )}
    </div>
  )
}

export default Likes
