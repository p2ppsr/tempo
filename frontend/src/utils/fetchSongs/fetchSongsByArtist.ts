import fetchSongs from './fetchSongs'
import type { TSPLookupQuery } from '../../types/interfaces.js'

export const fetchSongsByArtist = async (artistIdentityKey: string) => {
  const query: TSPLookupQuery = {
    type: 'findAll',
    value: {
      artistIdentityKey,
      songIDs: []
    }
  }

  return await fetchSongs(query)
}
