import React, { useState } from 'react'
import './MySongs.scss'
import 'react-toastify/dist/ReactToastify.css'
import { Song } from '../../types/interfaces'

import testArtwork from '../../assets/AlbumArtwork/beatles.jpg'
import SongList from '../../components/SongList/SongList'

// test audio
import hereComesTheSun from '../../assets/Music/HereComesTheSun.mp3'
import zodiacGirls from '../../assets/Music/ZodiacGirls.mp3'
import useAsyncEffect from 'use-async-effect'
import { PublicKey, getPublicKey } from '@babbage/sdk'
import fetchSongs from '../../utils/fetchSongs'
import constants from '../../utils/constants'
import { download } from 'nanoseek'

const MySongs = () => {
  const testSongs: Song[] = [
    {
      title: 'Here Comes the Sun',
      artist: 'The Beatles',
      isPublished: true,
      audioURL: hereComesTheSun,
      artworkURL: testArtwork,
      description: 'A test song',
      duration: 180,
      token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
      outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
    },
    {
      title: 'Zodiac Girls',
      artist: 'Black Moth Super Rainbow',
      isPublished: true,
      audioURL: zodiacGirls,
      artworkURL:
        'https://i.discogs.com/qRvndWXrCEXL6qXvEAqdr3juNgOxJOgg58mwu85PR1w/rs:fit/g:sm/q:90/h:599/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEyNzg4/MzAtMTIxMDczNzcw/Mi5qcGVn.jpeg',
      description: 'A test song',
      duration: 180,
      token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
      outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
    }
  ]

  const [currentIdentityKey, setCurrentIdentityKey] = useState<PublicKey>({ key: '' })
  const [songs, setPlaybackSongs] = useState<Song[]>([])

  interface SearchFilter {
    findAll: boolean
    artistIdentityKey: PublicKey
  }

  useAsyncEffect(async () => {
    let searchFilter = {} as SearchFilter

    try {
      searchFilter.findAll = true
      searchFilter.artistIdentityKey = await getPublicKey({
        protocolID: 'tempo',
        keyID: '1'
      })
      // TODO: Where will this be used?
      // setCurrentIdentityKey(searchFilter.artistIdentityKey)
    } catch (e) {
      console.log(e)
    }

    try {
      // Get a list of song objects
      const res = await fetchSongs(searchFilter)

      setPlaybackSongs(res.reverse()) // Newest songs on top (note performance with large results)
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
        <SongList songs={songs} />
      </div>
    </div>
  )
}
export default MySongs
