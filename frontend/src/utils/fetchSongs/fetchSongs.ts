import type { Song } from '../../types/interfaces'
import { LookupResolver, Transaction } from '@bsv/sdk'
import { decodeOutputs } from '../../utils/decodeOutput'
import constants from '../constants'
import type { TSPLookupQuery, FindAllQuery } from '../../types/interfaces.js'
import { filterPlayableSongs } from '../catalogAvailability'
import { captureError, captureSignal } from '../usercom'

const CATALOG_LOOKUP_ATTEMPTS = 3

const wait = async (milliseconds: number) => await new Promise(resolve => window.setTimeout(resolve, milliseconds))

const fetchSongs = async (
  query: TSPLookupQuery = { type: 'findAll' } as FindAllQuery
): Promise<Song[]> => {
  const outputsByOutpoint = new Map<string, { beef: number[]; outputIndex: number }>()
  const attemptCounts: number[] = []
  let lastError: unknown

  for (let attempt = 0; attempt < CATALOG_LOOKUP_ATTEMPTS; attempt += 1) {
    try {
      // A fresh resolver avoids pinning all attempts to one stale discovery result.
      const resolver = new LookupResolver({
        networkPreset: constants.overlayNetworkPreset,
        hostOverrides: { [constants.overlayLookupService]: constants.tspLookupHosts },
        reputationStorage: { get: () => null, set: () => undefined }
      })
      const response = await resolver.query({
        service: constants.overlayLookupService,
        query
      }, 5000, { graceMs: 500 })

      if (response.type !== 'output-list') {
        throw new Error(`Unexpected response type: ${response.type}`)
      }

      attemptCounts.push(response.outputs.length)
      for (const output of response.outputs) {
        const txid = Transaction.fromBEEF(output.beef).id('hex')
        outputsByOutpoint.set(`${txid}:${output.outputIndex}`, output)
      }
    } catch (error) {
      lastError = error
      attemptCounts.push(0)
    }

    if (attempt < CATALOG_LOOKUP_ATTEMPTS - 1) await wait(200 * (attempt + 1))
  }

  if (outputsByOutpoint.size === 0 && lastError) {
    console.error('[fetchSongs] Error fetching song data:', lastError)
    captureError('catalog.lookup_failed', lastError, { queryType: query.type, attemptCounts })
    return []
  }

  captureSignal('catalog.lookup_completed', {
    surface: 'catalog',
    context: {
      queryType: query.type,
      attempts: CATALOG_LOOKUP_ATTEMPTS,
      attemptCounts,
      uniqueOutputs: outputsByOutpoint.size
    }
  })

  const parsedSongs = await decodeOutputs(
    [...outputsByOutpoint.values()].map((o) => ({ beef: o.beef, outputIndex: o.outputIndex }))
  )

  return await filterPlayableSongs(parsedSongs)
}

export default fetchSongs
