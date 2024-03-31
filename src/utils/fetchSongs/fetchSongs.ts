import PacketPay from '@packetpay/js'
import constants from '../constants'
import { Song, Token } from '../../types/interfaces'
import pushdrop from 'pushdrop'

const fetchSongs = async (searchFilter: object) => {
  let response
  console.log('searchFilter: ', searchFilter)
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

  console.log('lookupResult: ', lookupResult)

  let parsedSongs = lookupResult.map((songToken: Token) => {
    const decodedSong = pushdrop.decode({
      script: songToken.outputScript,
      fieldFormat: 'utf8'
    })

    console.log('decodedSong: ', decodedSong)

    const formattedSong = {
      topic: decodedSong.fields[0],
      protocolID: decodedSong.fields[1],
      title: decodedSong.fields[2],
      artist: decodedSong.fields[3],
      description: decodedSong.fields[4],
      length: decodedSong.fields[5],
      songURL: decodedSong.fields[6],
      artworkURL: decodedSong.fields[7],
      artistIdentityKey: decodedSong.lockingPublicKey,
      token: songToken,
      sats: songToken.satoshis
    }
    return formattedSong
  })
  return parsedSongs
}

export default fetchSongs
