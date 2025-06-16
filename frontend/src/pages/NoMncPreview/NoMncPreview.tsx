// Dependencies
import SongList from '../../components/SongList/SongList'

// Styles
import './NoMncPreview.scss'

// Assets
import dawnvisionsArtwork from '../../assets/AlbumArtwork/dawnvisions.jpg'
import dawnvisionsPreview from '../../assets/Music/Previews/Dawnvisions_preview.mp3'

import MurosArtwork from '../../assets/AlbumArtwork/muros.jpg'
import MurosPreview from '../../assets/Music/Previews/MurosInstrumental_preview.mp3'

import starfallArtwork from '../../assets/AlbumArtwork/starfall.jpg'
import starfallPreview from '../../assets/Music/Previews/Starfall_preview.mp3'

const previewSongs = [
  {
    title: 'Dawnvisions',
    artist: 'Dooblr',
    songURL: dawnvisionsPreview,
    artworkURL: dawnvisionsArtwork
  },
  {
    title: 'Muros Instrumental',
    artist: 'Muros',
    songURL: MurosPreview,
    artworkURL: MurosArtwork
  },
  {
    title: 'Starfall',
    artist: 'Dooblr',
    songURL: starfallPreview,
    artworkURL: starfallArtwork
  }
] as any

const NoMncPreview = () => {

  return (
    <>
      <div className="container">
        <div id="previewBanner">
          <h3>
            To get the full experience, please launch the Metanet Client. If you don't have it
            yet, it's available for{' '}
            <a href="https://projectbabbage.com/desktop/res/MetaNet%20Client.exe" target="_blank">
              Windows
            </a>
            ,{' '}
            <a href="https://projectbabbage.com/desktop/res/MetaNet%20Client.dmg" target="_blank">
              macOS
            </a>
            , and{' '}
            <a
              href="https://projectbabbage.com/desktop/res/MetaNet%20Client.AppImage"
              target="_blank"
            >
              Linux
            </a>
            .
          </h3>
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Previews</h1>
        <SongList songs={previewSongs} />
      </div>
    </>
  )
}

export default NoMncPreview
