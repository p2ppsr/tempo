import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import SongList from '../../components/SongList/SongList'
import loadDemoSongs from '../../utils/loadDemoSongs'
import bundledPreviewSongs from '../../utils/bundledPreviewSongs'

// Styles
import './NoMncPreview.scss'

const NoMncPreview = () => {
  const [songs, setSongs] = useState(bundledPreviewSongs)
  const [catalogStatus, setCatalogStatus] = useState('Checking live catalogue availability…')

  useEffect(() => {
    ;(async () => {
      try {
        const overlaySongs = await loadDemoSongs()
        const combined = [...bundledPreviewSongs, ...overlaySongs]
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
          Browse the verified catalogue without a wallet prompt. Pressing play buys and starts the full track
          through one clear Babbage Go permission flow.
        </p>
        <div className="heroActions">
          <a className="button primaryAction" href="#live-catalogue">Browse music</a>
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
