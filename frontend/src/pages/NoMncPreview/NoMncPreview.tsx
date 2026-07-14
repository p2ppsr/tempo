import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import SongList from '../../components/SongList/SongList'
import loadDemoSongs from '../../utils/loadDemoSongs'

// Styles
import './NoMncPreview.scss'

// Assets
import dawnvisionsArtwork from '../../assets/AlbumArtwork/dawnvisions.jpg'
import dawnvisionsPreview from '../../assets/Music/Previews/Dawnvisions_preview.mp3'

import MurosArtwork from '../../assets/AlbumArtwork/muros.jpg'
import MurosPreview from '../../assets/Music/Previews/MurosInstrumental_preview.mp3'

import starfallArtwork from '../../assets/AlbumArtwork/starfall.jpg'
import starfallPreview from '../../assets/Music/Previews/Starfall_preview.mp3'
import type { Song } from '../../types/interfaces'

const previewToken = {
  inputs: {}, mapiResponses: {}, outputScript: '', proof: {}, rawTX: '', satoshis: 0, txid: '', vout: 0
}

const hardcodedPreviewSongs: Song[] = [
  {
    title: 'Dawnvisions',
    artist: 'Dooblr',
    songURL: dawnvisionsPreview,
    decryptedSongURL: dawnvisionsPreview,
    artworkURL: dawnvisionsArtwork,
    isPublished: false,
    description: 'Bundled Tempo preview',
    duration: 15,
    token: previewToken
  },
  {
    title: 'Muros Instrumental',
    artist: 'Muros',
    songURL: MurosPreview,
    decryptedSongURL: MurosPreview,
    artworkURL: MurosArtwork,
    isPublished: false,
    description: 'Bundled Tempo preview',
    duration: 15,
    token: previewToken
  },
  {
    title: 'Starfall',
    artist: 'Dooblr',
    songURL: starfallPreview,
    decryptedSongURL: starfallPreview,
    artworkURL: starfallArtwork,
    isPublished: false,
    description: 'Bundled Tempo preview',
    duration: 15,
    token: previewToken
  }
]


const NoMncPreview = () => {
  const [songs, setSongs] = useState(hardcodedPreviewSongs)
  const [catalogStatus, setCatalogStatus] = useState('Checking live catalogue availability…')

  useEffect(() => {
    ;(async () => {
      try {
        const overlaySongs = await loadDemoSongs()
        const combined = [...hardcodedPreviewSongs, ...overlaySongs]
        setSongs(combined)
        setCatalogStatus(overlaySongs.length > 0
          ? `${overlaySongs.length} live independent release${overlaySongs.length === 1 ? '' : 's'} verified now.`
          : 'No independent releases currently have live storage and a purchase key. Bundled previews remain available.')
      } catch (err) {
        console.error('[NoMncPreview] Failed to load overlay previews:', err)
        setCatalogStatus('The live catalogue could not be verified. Bundled previews remain available.')
        toast.warn('Tempo could not verify the live catalogue. Try again shortly.')
      }
    })()
  }, [])

  return (
    <div className="container noMncPreviewContainer">
      <div id="previewBanner" className="tempoHero">
        <p className="heroEyebrow">Direct music · live availability · wallet-approved payments</p>
        <h1>Hear it now. Own the release path.</h1>
        <p>
          Preview music without a wallet prompt. When you publish or unlock a full track,
          Babbage Go opens one clear Metanet permission flow.
        </p>
        <div className="heroActions">
          <a className="button primaryAction" href="#live-catalogue">Browse playable music</a>
          <a className="button secondaryAction" href="/PublishSong">Publish a song</a>
        </div>
      </div>

      <div id="live-catalogue" className="catalogueHeading">
        <div>
          <p className="sectionEyebrow">Verified catalogue</p>
          <h2 className="previewHeading">Playable right now</h2>
        </div>
        <p className="catalogStatus" role="status">{catalogStatus}</p>
      </div>
      <SongList songs={songs} />
    </div>
  )
}

export default NoMncPreview
