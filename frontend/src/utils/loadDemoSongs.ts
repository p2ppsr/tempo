import type { Song } from '../types/interfaces'

// Assets
import dawn from '../assets/Music/Previews/Dawnvisions_preview.mp3'
import muros from '../assets/Music/Previews/MurosInstrumental_preview.mp3'
import starfall from '../assets/Music/Previews/Starfall_preview.mp3'
import dawnArt from '../assets/AlbumArtwork/dawnvisions.jpg'
import murosArt from '../assets/AlbumArtwork/muros.jpg'
import starfallArt from '../assets/AlbumArtwork/starfall.jpg'

/**
 * Converts a static file to a Blob URL for use in audio/image components.
 */
async function toObjectURL(file: string): Promise<string> {
  const response = await fetch(file)
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

/**
 * Returns an array of demo songs in the same format as overlay songs.
 */
export default async function loadDemoSongs(): Promise<Song[]> {
  const previews = await Promise.all([
    toObjectURL(dawn),
    toObjectURL(muros),
    toObjectURL(starfall),
    toObjectURL(dawnArt),
    toObjectURL(murosArt),
    toObjectURL(starfallArt)
  ])

  return [
    {
      title: 'Dawnvisions',
      artist: 'Demo Artist',
      description: 'A dreamy instrumental.',
      duration: 180,
      isPublished: true,
      sats: 1000,
      songURL: previews[0],
      artworkURL: previews[3],
      artistIdentityKey: 'demo-key',
      token: {
        txid: 'demo',
        vout: 0,
        satoshis: 1000,
        outputScript: 'demo',
        rawTX: '00',
        proof: {},
        inputs: [],
        mapiResponses: []
      }
    },
    {
      title: 'Muros Instrumental',
      artist: 'Demo Artist',
      description: 'Moody and minimal.',
      duration: 195,
      isPublished: true,
      sats: 1000,
      songURL: previews[1],
      artworkURL: previews[4],
      artistIdentityKey: 'demo-key',
      token: {
        txid: 'demo',
        vout: 1,
        satoshis: 1000,
        outputScript: 'demo',
        rawTX: '00',
        proof: {},
        inputs: [],
        mapiResponses: []
      }
    },
    {
      title: 'Starfall',
      artist: 'Demo Artist',
      description: 'Synth-heavy cosmic tones.',
      duration: 205,
      isPublished: true,
      sats: 1000,
      songURL: previews[2],
      artworkURL: previews[5],
      artistIdentityKey: 'demo-key',
      token: {
        txid: 'demo',
        vout: 2,
        satoshis: 1000,
        outputScript: 'demo',
        rawTX: '00',
        proof: {},
        inputs: [],
        mapiResponses: []
      }
    }
  ]
}
