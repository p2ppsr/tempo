import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAsyncEffect from 'use-async-effect'
import SongList from '../../components/SongList/SongList'
import { getSongDataFromHash } from '../../utils/getSongDataFromHash'

const ViewSong = () => {
  const { songURL } = useParams()

  const [song, setSong] = useState() as any // TODO: Set this type

  // Use the songURL param to fetch the song data to display
  useAsyncEffect(async () => {
    if (!songURL) {
      throw new Error('Error: no songURL was provided')
    }
    const songData = await getSongDataFromHash(songURL)
    setSong(songData)
  }, [songURL])

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
