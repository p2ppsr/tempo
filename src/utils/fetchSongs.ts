import PacketPay from '@packetpay/js'
import constants from './constants'
import { Song } from '../types/interfaces'
import pushdrop from 'pushdrop'

const fetchSongs = async (searchFilter: object) => {
  let response
  try {
    response = await PacketPay(`${constants.confederacyURL}/lookup`, {
      method: 'POST',
      body: {
        provider: 'TSP',
        query: {
          ...searchFilter 
        }
      }
    })
  } catch (e) {
    console.log(e)
  }

  const lookupResult = JSON.parse(Buffer.from(response?.body).toString('utf8'))

  let parsedSongs = lookupResult.map((song: Song) => {
    const decodedSong = pushdrop.decode({
      script: song.outputScript,
      fieldFormat: 'utf8'
    })
    console.log(decodedSong)
    const formattedSong = {
      topic: decodedSong.fields[0],
      protocolID: decodedSong.fields[1],
      title: decodedSong.fields[2],
      artist: decodedSong.fields[3],
      description: decodedSong.fields[4],
      length: decodedSong.fields[5],
      audioURL: decodedSong.fields[6],
      artworkURL: decodedSong.fields[7],
      artistIdentityKey: decodedSong.lockingPublicKey
    }
    return formattedSong
  })
  return parsedSongs
}

export default fetchSongs
