import type { Song } from '../types/interfaces'
import { LookupResolver } from '@bsv/sdk'
import { decodeOutputs } from '../utils/decodeOutput'
import constants from './constants'
import { filterPlayableSongs } from './catalogAvailability'

const resolver = new LookupResolver({
  networkPreset: constants.overlayNetworkPreset
})

/**
 * loadDemoSongs
 * - Queries the overlay for publicly available preview songs.
 * - Returns only songs whose required storage and purchase key are live.
 * - Uses a wallet-free preview when the publisher supplied one.
 */
export default async function loadDemoSongs(): Promise<Song[]> {
  console.log('[loadDemoSongs] Querying overlay for previews...')

  try {
    const response = await resolver.query({
      service: constants.overlayLookupService,
      query: { type: 'findAll', value: {} }
    })

    if (response.type !== 'output-list') {
      console.warn('[loadDemoSongs] Unexpected response type:', response)
      return []
    }

    if (!Array.isArray(response.outputs) || response.outputs.length === 0) {
      console.warn('[loadDemoSongs] No outputs returned from overlay.')
      return []
    }

    const parsedOverlaySongs = await decodeOutputs(
      response.outputs.map((o) => ({ beef: o.beef, outputIndex: o.outputIndex }))
    )

    const playableSongs = await filterPlayableSongs(parsedOverlaySongs)

    playableSongs.forEach((song) => {
      if (song.previewURL) song.decryptedSongURL = song.previewURL
    })

    return playableSongs
  } catch (err) {
    console.error('[loadDemoSongs] Failed to load overlay previews:', err)
    return []
  }
}
