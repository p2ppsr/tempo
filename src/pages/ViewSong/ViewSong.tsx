import React, { useState } from 'react'
import { useParams } from 'react-router'
import useAsyncEffect from 'use-async-effect'
import SongList from '../../components/SongList/SongList'
import { getSongDataFromHash } from '../../utils/getSongDataFromHash'

const ViewSong = () => {
  const { audioURL } = useParams()

  const [song, setSong] = useState() as any // TODO: Set this type

  // Use the audioURL param to fetch the song data to display
  useAsyncEffect(async () => {
    if (!audioURL) {
      throw new Error('Error: no audioURL was provided')
    }
    const songData = await getSongDataFromHash(audioURL)
    setSong(songData)
  }, [])

  return (
    <div className="container">
      {song && (
        <>
          <h1>{song.title}</h1>
          <h2 style={{ marginBottom: '1rem' }}>{song.artist}</h2>
          <SongList songs={[song]} />
        </>
      )}
    </div>
  )
}

export default ViewSong
