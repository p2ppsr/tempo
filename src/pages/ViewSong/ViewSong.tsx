import React, { useState } from 'react'
import { useParams } from 'react-router'
import fetchSongs from '../../utils/fetchSongs/fetchSongs'
import useAsyncEffect from 'use-async-effect'
import SongList from '../../components/SongList/SongList'

const ViewSong = () => {
  const { audioURL } = useParams()

  const [song, setSong] = useState() as any

  useAsyncEffect(async () => {
    const res = await fetchSongs({
      findAll: true,
      songIDs: [audioURL as string].map((song: string) => {
        return Buffer.from(song).toString('base64')
      })
    })

    setSong(res[0])
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
