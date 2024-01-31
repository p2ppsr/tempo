import PacketPay from "@packetpay/js"
import constants from "./constants"
import { Song } from "../../types/interfaces"
import pushdrop from "pushdrop"

const fetchSongs = async (searchFilter: object) => {
  const response = await PacketPay(`${constants.confederacyURL}/lookup`, {
    method: "POST",
    body: {
      provider: "TSP",
      query: {
        ...searchFilter,
      },
    },
  })
  const lookupResult = JSON.parse(Buffer.from(response.body).toString("utf8"))
  let parsedSongs = lookupResult.map(({ song }: { song: Song }) => {
    const decodedSong = pushdrop.decode({
      script: song.outputScript,
      fieldFormat: "utf8",
    })
    const formattedSong = {
      topic: decodedSong.fields[0],
      protocolID: decodedSong.fields[1],
      title: decodedSong.fields[2],
      artist: decodedSong.fields[3],
      description: decodedSong.fields[4],
      length: decodedSong.fields[5],
      songFileURL: decodedSong.fields[6],
      artworkFileURL: decodedSong.fields[7],
      artistIdentityKey: decodedSong.lockingPublicKey,
    }
    return formattedSong
  })
  return parsedSongs
}

export default fetchSongs
