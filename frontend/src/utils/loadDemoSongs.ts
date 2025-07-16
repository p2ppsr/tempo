import type { Song } from '../types/interfaces'
import { LookupResolver } from '@bsv/sdk'
import { decodeOutputs } from '../utils/decodeOutput'

const resolver = new LookupResolver({
  networkPreset: window.location.hostname === 'localhost' ? 'local' : 'mainnet'
})

/**
 * loadDemoSongs
 * - Queries the overlay for publicly available preview songs.
 * - Returns an array of songs that include a previewURL (unencrypted).
 */
export default async function loadDemoSongs(): Promise<Song[]> {
  console.log('[loadDemoSongs] Querying overlay for previews...')

  try {
    const response = await resolver.query({
      service: 'ls_tsp',
      query: { type: 'findAll', value: {} }
    })

    console.log('[loadDemoSongs] Resolver response:', response)

    if (response.type !== 'output-list') {
      console.warn('[loadDemoSongs] Unexpected response type:', response)
      return []
    }

    if (!Array.isArray(response.outputs) || response.outputs.length === 0) {
      console.warn('[loadDemoSongs] No outputs returned from overlay.')
      return []
    }

    console.log(`[loadDemoSongs] Decoding ${response.outputs.length} outputs...`)
    const parsedOverlaySongs = await decodeOutputs(
      response.outputs.map((o) => ({ beef: o.beef, outputIndex: o.outputIndex }))
    )

    console.log('[loadDemoSongs] Decoded songs:', parsedOverlaySongs)

    const overlayPreviews = parsedOverlaySongs.filter((song, index) => {
      const hasPreview = !!song.previewURL
      console.log(`[loadDemoSongs] [#${index}] Title: ${song.title}, Has Preview: ${hasPreview}, Preview URL:`, song.previewURL)
      return hasPreview
    })

    overlayPreviews.forEach((song) => {
      song.decryptedSongURL = song.previewURL
    })

    console.log('[loadDemoSongs] Overlay previews found:', overlayPreviews.length)
    return overlayPreviews
  } catch (err) {
    console.error('[loadDemoSongs] Failed to load overlay previews:', err)
    return []
  }
}
