import { Song } from "../types/interfaces"
import fetchSongs from "./fetchSongs/fetchSongs"

export const getSongDataFromHash = async (songURL: string): Promise<Song> => {

  const res = await fetchSongs({
    findAll: true,
    songIDs: [songURL].map((song: string) => {
      return Buffer.from(song).toString('base64')
    })
  })

  return res[0]
}