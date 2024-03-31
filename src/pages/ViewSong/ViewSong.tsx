import React, { useState } from 'react'
import { useParams } from 'react-router'
import useAsyncEffect from 'use-async-effect'
import SongList from '../../components/SongList/SongList'
import { getSongDataFromHash } from '../../utils/getSongDataFromHash'
import { Song } from '../../types/interfaces'

const ViewSong = () => {
  const { songURL } = useParams<{ songURL: string }>()

  const [song, setSong] = useState<Song | null>(null)

  useAsyncEffect(async () => {
    if (!songURL) {
      throw new Error('Error: no songURL was provided')
    }
    const songsData = await getSongDataFromHash(songURL)
    // Assuming songURL should match some property in the songs data to find the specific song
    const matchingSong = songsData.find(song => song.songURL === songURL)
    if (matchingSong) {
      setSong(matchingSong)
    } else {
      console.error('No matching song found')
    }
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
