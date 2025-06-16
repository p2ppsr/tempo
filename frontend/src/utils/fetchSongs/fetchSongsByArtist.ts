import fetchSongs from './fetchSongs'
import type { TSPLookupQuery } from '../../types/interfaces.js' // adjust path as needed

export const fetchSongsByArtist = async (artistIdentityKey: string) => {
  const query: TSPLookupQuery = {
    type: 'findAll',
    value: {
      artistIdentityKey,
      songIDs: [] // empty filter if needed
    }
  }

  return await fetchSongs(query)
}
