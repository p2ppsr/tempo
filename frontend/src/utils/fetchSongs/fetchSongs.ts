import type { Song } from '../../types/interfaces'
import {
  LookupResolver,
  LockingScript,
  PushDrop,
  Utils
} from '@bsv/sdk'
import type {
  TSPLookupQuery,
  FindAllQuery
} from '../../types/interfaces.js'

function isHexScript(script: string | object): script is string {
  return typeof script === 'string'
}

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
    console.error('Error fetching song data:', e)
    return []
  }

  const parsedSongs: Song[] = lookupResult.map((output: any, i: number) => {
    try {
      const lockingScript = isHexScript(output.script)
        ? LockingScript.fromHex(output.script)
        : new LockingScript((output.script as any).chunks)

      const decoded = PushDrop.decode(lockingScript)

      const song: Song = {
        title: Utils.toUTF8(decoded.fields[2]),
        artist: Utils.toUTF8(decoded.fields[3]),
        isPublished: true,
        songURL: Utils.toUTF8(decoded.fields[6]),
        artworkURL: Utils.toUTF8(decoded.fields[7]),
        description: Utils.toUTF8(decoded.fields[4]),
        duration: parseInt(Utils.toUTF8(decoded.fields[5])),
        sats: output.satoshis,
        artistIdentityKey: decoded.lockingPublicKey.toString(),
        token: {
          outputScript: lockingScript.toHex(),
          satoshis: output.satoshis,
          txid: output.txid,
          vout: output.outputIndex
        }
      } as Song

      console.log(`[fetchSongs] Parsed song #${i + 1}:`, song)
      return song
    } catch (err) {
      console.warn(`[fetchSongs] Skipping invalid output #${i + 1}:`, err)
      return null
    }
  }).filter((s): s is Song => s !== null)

  console.log('[fetchSongs] Returning parsed songs:', parsedSongs)
  return parsedSongs
}

export default fetchSongs
