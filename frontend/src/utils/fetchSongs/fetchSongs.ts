import type { Song } from '../../types/interfaces'
import { LookupResolver } from '@bsv/sdk'
import { decodeOutputs } from '../../utils/decodeOutput'
import constants from '../constants'
import type { TSPLookupQuery, FindAllQuery } from '../../types/interfaces.js'
import { filterPlayableSongs } from '../catalogAvailability'
import { captureError } from '../usercom'

const fetchSongs = async (
  query: TSPLookupQuery = { type: 'findAll' } as FindAllQuery
): Promise<Song[]> => {
  const resolver = new LookupResolver({
    networkPreset: constants.overlayNetworkPreset
  })

  let lookupResult: Array<{ beef: number[]; outputIndex: number }> = []

  try {
    const response = await resolver.query({
      service: constants.overlayLookupService,
      query
    })

    if (response.type !== 'output-list') {
      throw new Error(`Unexpected response type: ${response.type}`)
    }

    lookupResult = response.outputs
  } catch (e) {
    console.error('[fetchSongs] Error fetching song data:', e)
    captureError('catalog.lookup_failed', e, { queryType: query.type })
    return []
  }


  const parsedSongs = await decodeOutputs(
    lookupResult.map((o) => ({ beef: o.beef, outputIndex: o.outputIndex }))
  )

  return await filterPlayableSongs(parsedSongs)
}

export default fetchSongs
