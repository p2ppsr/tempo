import { Song } from "../types/interfaces"
import fetchSongs from "./fetchSongs/fetchSongs"

export const getSongDataFromHash = async (songURL: string): Promise<Song> => {
<<<<<<< Updated upstream

  const res = await fetchSongs({
=======
  console.log(`called getSongFromHash with songURL: `, songURL)

  const encodedSongURL = Buffer.from(songURL).toString('base64')

  const response = await fetchSongs({
>>>>>>> Stashed changes
    findAll: true,
    songIDs: [encodedSongURL]
  })

<<<<<<< Updated upstream
  return res[0]
}
=======
  return response[0]
}
>>>>>>> Stashed changes
