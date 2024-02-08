import { useEffect, useState } from 'react'
import * as musicMetadata from 'music-metadata-browser'
import './Playlists.scss'
import { Song } from '../../types/interfaces'
import React from 'react'

interface Playlist {
  id: string
  title: string
  songs: Song[]
}

const songExample: Song = {
  title: 'Here Comes the Sun',
  artist: 'The Beatles',
  isPublished: true,
  selectedMusic: new File([], 'placeholder.txt'),
  artworkURL: '',
  description: '',
  audioURL: '',
  duration: 185,
  songID: '',
  token: { outputIndex: 0, txid: '', lockingScript: '' },
  outputScript: {
    fields: [new Buffer('')],
    protocolID: [0, ''],
    keyID: ''
  }
}

const Playlists = () => {
  const [coverArt, setCoverArt] = useState('')

  const fetchCoverArt = async () => {
    let url = '' // Variable to hold the object URL

    try {
      const response = await fetch('/Music/song0.mp3')
      const blob = await response.blob()

      // Log the Blob type and properties for debugging
      console.log('Blob type:', blob.constructor.name) // Should log 'Blob'
      console.log('Blob size:', blob.size)
      console.log('Blob content type:', blob.type) // Should be 'audio/mpeg' for MP3 files

      // Convert the Blob to a Buffer or Uint8Array
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      // Use the buffer with parseBlob
      const metadata = await musicMetadata.parseBuffer(buffer, {
        mimeType: blob.type,
        size: blob.size
      })

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0]
        url = URL.createObjectURL(new Blob([picture.data], { type: picture.format }))
        setCoverArt(url)
      } else {
        console.log('No cover art found in the MP3 file.')
      }
    } catch (error) {
      console.error('Error fetching cover art:', error)
    }
  }

  useEffect(() => {
    fetchCoverArt()

    return () => {
      if (url) {
        URL.revokeObjectURL(url) // Clean up the object URL
      }
    }
  }, [])

  return (
    <>
      <div className="container">
        <h1>Playlists</h1>
        <button className="playlistLink">Beatles Playlist</button>
        {coverArt && <img src={coverArt} alt="Cover Art" />}
      </div>
    </>
  )
}

export default Playlists
