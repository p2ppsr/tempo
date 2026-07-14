import { PublicKey } from '@bsv/sdk'
import fetchSongs from './fetchSongs'
import type { TSPLookupQuery } from '../../types/interfaces.js'
import { getInteractiveWallet } from '../wallet'

const fetchUserSongs = async () => {
  const wallet = getInteractiveWallet()

  const { publicKey: pubKeyString } = await wallet.getPublicKey({
    protocolID: [2, 'tmtsp'],
    keyID: '1',
    counterparty: 'anyone',
    forSelf: true
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
