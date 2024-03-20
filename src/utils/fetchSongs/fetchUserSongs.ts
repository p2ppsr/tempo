import { getPublicKey } from '@babbage/sdk-ts'
import fetchSongs from './fetchSongs'
import { SearchFilter } from '../../types/interfaces'

const fetchUserSongs = async () => {
  const artistIdentityKey = await getPublicKey({
    protocolID: 'Tempo',
    keyID: '1'
  })

  const searchFilter = { findAll: true, artistIdentityKey: artistIdentityKey } as SearchFilter

  try {
    // Get a list of song objects
    const res = await fetchSongs(searchFilter)

    return res.reverse() // Newest songs on top (note performance with large results)
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
  }
}

export default fetchUserSongs
