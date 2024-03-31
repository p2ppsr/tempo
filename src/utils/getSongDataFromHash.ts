import { Song } from '../types/interfaces'
import fetchSongs from './fetchSongs/fetchSongs'

export const getSongDataFromHash = async (songURL: string): Promise<Song[]> => {
  const res = await fetchSongs({
    findAll: true,
    songIDs: [songURL].map((song: string) => Buffer.from(song).toString('base64'))
  })

  return res // This is now expected to be an array of Song objects
}
