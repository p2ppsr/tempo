import { Song } from '../types/interfaces'
import fetchSongs from './fetchSongs/fetchSongs'

export const getSongDataFromHash = async (songURL: string): Promise<Song> => {
  console.log(`called getSongFromHash with songURL: `, songURL)

  const encodedSongURL = Buffer.from(songURL).toString('base64')

  const response = await fetchSongs({
    findAll: true,
    songIDs: [encodedSongURL]
  })

  console.log('getSongDataFromHash response: ', response)

  return response
}
