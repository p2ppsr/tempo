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


  const parsedSongs = await decodeOutputs(
    lookupResult.map((o) => ({ beef: o.beef, outputIndex: o.outputIndex }))
  )

  // Detect MetaNet Client availability
  const userHasMetanetClient = typeof window !== 'undefined' && !!(window as any).metaid

  parsedSongs.forEach((song, idx) => {
  // Assign preview URL as decryptedSongURL if no MNC available
  if (!userHasMetanetClient && song.previewURL && !song.decryptedSongURL) {
    song.decryptedSongURL = song.previewURL
  }

  console.log(`[fetchSongs] Song #${idx + 1} URLs:`, {
    artworkURL: `https://${window.location.hostname === 'localhost' ? 'localhost:3000' : 'YOUR-UHRP-DOMAIN'}/${song.artworkURL}`,
    songURL: `https://${window.location.hostname === 'localhost' ? 'localhost:3000' : 'YOUR-UHRP-DOMAIN'}/${song.songURL}`,
    previewURL: song.previewURL,
    decryptedSongURL: song.decryptedSongURL
  })
})


  console.log('[fetchSongs] Returning parsed songs:', parsedSongs)
  return parsedSongs
}

export default fetchSongs
