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

const MySongs = () => {
  const testSongs: Song[] = [
    {
      title: 'Here Comes the Sun',
      artist: 'The Beatles',
      isPublished: true,
      songFileURL: hereComesTheSun,
      // local artwork
      artworkFileURL: testArtwork,
      description: 'A test song',
      duration: 180,
      songID: '12345',
      token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
      outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
    },
    {
      title: 'Zodiac Girls',
      artist: 'Black Moth Super Rainbow',
      isPublished: true,
      songFileURL: zodiacGirls,
      // imported artwork from url
      artworkFileURL:
        'https://i.discogs.com/qRvndWXrCEXL6qXvEAqdr3juNgOxJOgg58mwu85PR1w/rs:fit/g:sm/q:90/h:599/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEyNzg4/MzAtMTIxMDczNzcw/Mi5qcGVn.jpeg',
      description: 'A test song',
      duration: 180,
      songID: '12345',
      token: { outputIndex: 0, txid: '12345', lockingScript: 'asdf' },
      outputScript: { fields: [''], protocolID: 'asdf', keyID: 'asdf' }
    }
  ]

  const [currentIdentityKey, setCurrentIdentityKey] = useState<PublicKey>({key: ''})
  const [songs, setSongs] = useState<Song[]>([])

  interface SearchFilter {
    findAll: boolean
    artistIdentityKey: PublicKey
  }

  useAsyncEffect(async () => {
    // searchFilter ? searchFilter : {}
    let searchFilter = {} as SearchFilter

    try {
      searchFilter.findAll = true
      searchFilter.artistIdentityKey = await getPublicKey({
        protocolID: 'tempo',
        keyID: '1'
      })
      setCurrentIdentityKey(searchFilter.artistIdentityKey)
    } catch (e) {
      console.log(e)
    }

    try {
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
        <SongList songs={songs} />
        {/* <SongsViewer
					searchFilter={{ findAll: 'true', artistIdentityKey: '' }}
					mySongsOnly={true}
				/> */}
      </div>
    </div>
  )
}
export default MySongs
