import React, { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { SearchFilter, Song } from '../../types/interfaces'
import './MySongs.scss'

import testArtwork from '../../assets/AlbumArtwork/beatles.jpg'
import SongList from '../../components/SongList/SongList'

// test audio
import { PublicKey, getPublicKey } from '@babbage/sdk'
import { CircularProgress } from '@mui/material'
import useAsyncEffect from 'use-async-effect'
import hereComesTheSun from '../../assets/Music/HereComesTheSun.mp3'
import zodiacGirls from '../../assets/Music/ZodiacGirls.mp3'
import fetchSongs from '../../utils/fetchSongs'

const MySongs = () => {
  // const testSongs: Song[] = [
  //   {
  //     title: 'Here Comes the Sun',
  //     artist: 'The Beatles',
  //     isPublished: true,
  //     audioURL: hereComesTheSun,
  //     artworkURL: testArtwork,
  //     description: 'A test song',
  //     duration: 180,
  //     token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
  //     outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
  //   },
  //   {
  //     title: 'Zodiac Girls',
  //     artist: 'Black Moth Super Rainbow',
  //     isPublished: true,
  //     audioURL: zodiacGirls,
  //     artworkURL:
  //       'https://i.discogs.com/qRvndWXrCEXL6qXvEAqdr3juNgOxJOgg58mwu85PR1w/rs:fit/g:sm/q:90/h:599/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEyNzg4/MzAtMTIxMDczNzcw/Mi5qcGVn.jpeg',
  //     description: 'A test song',
  //     duration: 180,
  //     token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
  //     outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
  //   }
  // ]

  const [currentIdentityKey, setCurrentIdentityKey] = useState<PublicKey>({ key: '' })
  const [songs, setSongs] = useState<Song[]>([])

  useAsyncEffect(async () => {
    const artistIdentityKey = await getPublicKey({
      protocolID: 'Tempo',
      keyID: '1'
    })

    const searchFilter = { findAll: true, artistIdentityKey: artistIdentityKey } as SearchFilter

    try {
      // Get a list of song objects
      const res = await fetchSongs(searchFilter)

      setSongs(res.reverse()) // Newest songs on top (note performance with large results)
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      } else {
        // Handle cases where the caught object is not an Error instance
        console.log('An unexpected error occurred:', e)
      }
    }
  }, [])

  return (
    <div className="container">
      <h1>My Songs</h1>

      <div>
        {songs.length === 0 ? (
          <div className="loadingContainer">
            <CircularProgress />
          </div>
        ) : (
          <SongList songs={songs} />
        )}
      </div>
    </div>
  )
}
export default MySongs
