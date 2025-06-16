import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import SongList from '../../components/SongList/SongList'
import { getSongDataFromHash } from '../../utils/getSongDataFromHash'
import type { Song } from '../../types/interfaces'

const ViewSong = () => {
  const { songURL } = useParams<{ songURL: string }>()

  const [song, setSong] = useState<Song | null>(null)

  useEffect(() => {
    const loadSong = async () => {
      if (!songURL) {
        console.error('Error: no songURL was provided')
        return
      }

      try {
        const songsData = await getSongDataFromHash(songURL)
        const matchingSong = songsData.find(song => song.songURL === songURL)
        if (matchingSong) {
          setSong(matchingSong)
        } else {
          console.error('No matching song found')
        }
      } catch (error) {
        console.error('Failed to load song data:', error)
      }
    }

    loadSong()
  }, [songURL])

  if (!song) {
    return <div>Loading or no song found...</div>
  }

  return (
    <div className="container">
      <h1>{song.title}</h1>
      <h2 style={{ marginBottom: '1rem' }}>{song.artist}</h2>
      <SongList songs={[song]} />
    </div>
  )
}

export default ViewSong
