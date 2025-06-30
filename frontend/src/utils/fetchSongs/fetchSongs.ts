import type { Song } from '../../types/interfaces'
import { LookupResolver } from '@bsv/sdk'
import { decodeOutputs } from '../../utils/decodeOutput'
import type { TSPLookupQuery, FindAllQuery } from '../../types/interfaces.js'

const fetchSongs = async (
  query: TSPLookupQuery = { type: 'findAll' } as FindAllQuery
): Promise<Song[]> => {
  const resolver = new LookupResolver({
    networkPreset: window.location.hostname === 'localhost' ? 'local' : 'mainnet'
  })

  let lookupResult: any[] = []

  try {
    console.log('[fetchSongs] Sending query:', query)
    const response = await resolver.query({
      service: 'ls_tsp',
      query
    })
    console.log('[fetchSongs] Received response:', response)

    if (response.type !== 'output-list') {
      throw new Error(`Unexpected response type: ${response.type}`)
    }

    lookupResult = response.outputs
    console.log('[fetchSongs] Raw outputs:', lookupResult)
  } catch (e) {
    console.error('[fetchSongs] Error fetching song data:', e)
    return []
  }

  // Decode the fetched outputs using your decode utility
  const parsedSongs = await decodeOutputs(
    lookupResult.map((o) => ({ beef: o.beef, outputIndex: o.outputIndex }))
  )

  // Print each song’s URLs so you can copy/paste them directly to test
  parsedSongs.forEach((song, idx) => {
    console.log(`[fetchSongs] Song #${idx + 1} URLs:`, {
      artworkURL: `https://${window.location.hostname === 'localhost' ? 'localhost:3000' : 'YOUR-UHRP-DOMAIN'}/${song.artworkURL}`,
      songURL: `https://${window.location.hostname === 'localhost' ? 'localhost:3000' : 'YOUR-UHRP-DOMAIN'}/${song.songURL}`
    })
  })

  console.log('[fetchSongs] Returning parsed songs:', parsedSongs)
  return parsedSongs
}

export default fetchSongs
