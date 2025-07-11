import { PublicKey, WalletClient } from '@bsv/sdk'
import fetchSongs from './fetchSongs'
import type { TSPLookupQuery } from '../../types/interfaces.js'

const fetchUserSongs = async () => {
  const wallet = new WalletClient('auto', 'localhost')

  const { publicKey: pubKeyString } = await wallet.getPublicKey({
    protocolID: [2, 'Tempo'],
    keyID: '1'
  })

  const artistIdentityKey = PublicKey.fromString(pubKeyString).toString()

  const query: TSPLookupQuery = {
    type: 'findAll',
    value: {
      artistIdentityKey,
      songIDs: []
    }
  }

  try {
    const res = await fetchSongs(query)
    return res.reverse()
  } catch (e) {
    if (e instanceof Error) {
      console.error('[fetchUserSongs] Error:', e.message)
    }
    return []
  }
}

export default fetchUserSongs
