import dawnvisionsArtwork from '../assets/AlbumArtwork/dawnvisions.jpg'
import dawnvisionsPreview from '../assets/Music/Previews/Dawnvisions_preview.mp3'
import MurosArtwork from '../assets/AlbumArtwork/muros.jpg'
import MurosPreview from '../assets/Music/Previews/MurosInstrumental_preview.mp3'
import starfallArtwork from '../assets/AlbumArtwork/starfall.jpg'
import starfallPreview from '../assets/Music/Previews/Starfall_preview.mp3'
import type { Song } from '../types/interfaces'

const previewToken = {
  inputs: {}, mapiResponses: {}, outputScript: '', proof: {}, rawTX: '', satoshis: 0, txid: '', vout: 0
}

const bundledPreviewSongs: Song[] = [
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

export default bundledPreviewSongs
