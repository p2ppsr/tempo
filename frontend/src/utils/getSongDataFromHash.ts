import type { Song } from '../types/interfaces'
import fetchSongs from './fetchSongs/fetchSongs'
import type { FindBySongIDsQuery } from '../types/interfaces.js'
import { Utils } from '@bsv/sdk'

/**
 * Fetches the song data for a single song given its songURL (typically a hash).
 */
export const getSongDataFromHash = async (songURL: string): Promise<Song[]> => {
  const query: FindBySongIDsQuery = {
    type: 'findBySongIDs',
    value: {
      songIDs: [Utils.toBase64(Utils.toArray(songURL, 'utf8'))]
    }
  }

  const res = await fetchSongs(query)
  return res
}
