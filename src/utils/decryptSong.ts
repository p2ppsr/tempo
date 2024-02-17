import { Authrite, AuthriteResponse } from 'authrite-js'
import { decrypt } from 'cwi-crypto'
import { createAction, getPublicKey } from '@babbage/sdk'
import bsv from 'babbage-bsv'
import { download } from 'nanoseek'
import constants from './constants'
import { Song } from '../types/interfaces'

const decryptSong = async (song: Song) => {

  if (!song.audioURL) {
    return
  }

  const [encryptedData, purchasedKey] = await Promise.all([
    (async () => {
      // could be cached
      console.time('Nanoseek download time')
      const { data: encryptedData } = await download({
        UHRPUrl: song.audioURL,
        confederacyHost: constants.confederacyURL
      })
      console.timeEnd('Nanoseek download time')
      return encryptedData
    })(),
    (async (): Promise<AuthriteResponse> => {
      // Get purchcase invoice from key-server recipient
      console.time('Authrite invoice response time')
      const invoiceResponse = await new Authrite().request(`${constants.keyServerURL}/invoice`, {
        body: {
          songURL: song.audioURL
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.timeEnd('Authrite invoice reponse time')

      const invoice = JSON.parse(Buffer.from(invoiceResponse.body).toString('utf8'))

      const paymentDescription = `You listened to ${song.title}, by ${song.artist}`

      // Pay the recipient
      const derivationPrefix = require('crypto')
        .randomBytes(10)
        .toString('base64')
      const derivationSuffix = require('crypto')
        .randomBytes(10)
        .toString('base64')

      // Derive the public key used for creating the output script
      console.time('getPublicKey response time')
      const derivedPublicKey = await getPublicKey({
        protocolID: [2, '3241645161d8'],
        keyID: `${derivationPrefix} ${derivationSuffix}`,
        counterparty: invoice.identityKey
      })
      console.timeEnd('getPublicKey response time')

      // Create an output script that can only be unlocked with the corresponding derived private key
      const scriptObject = bsv.Script.fromAddress(bsv.Address.fromPublicKey(bsv.PublicKey.fromString(derivedPublicKey)))

      // Convert the Script object to a hexadecimal string
      const scriptHexString = scriptObject.toHex()

      console.time('createAction response time')
      const payment = await createAction({
        description: paymentDescription,
        inputs: [], // Provide the appropriate value for inputs
        topic: [], // Provide the appropriate value for topic
        outputs: [
          {
            script: scriptHexString, // Ensure this is a string
            satoshis: parseInt(invoice.amount)
          }
        ]
      })
      console.timeEnd('createAction response time')

      // Send the recipient proof of payment
      console.time('Authrite pay response time')
      const purchasedKey = await new Authrite().request(`${constants.keyServerURL}/pay`, {
        body: {
          derivationPrefix,
          songURL: song.audioURL,
          transaction: {
            ...payment,
            outputs: [
              {
                vout: 0,
                satoshis: invoice.amount,
                derivationSuffix
              }
            ]
          },
          orderID: invoice.orderID
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.timeEnd('Authrite pay response time')
      return purchasedKey
    })()
  ])


  // Parse out the decryption key and decrypt the song data
  const key = JSON.parse(Buffer.from(purchasedKey.body).toString('utf8')).result // !! Receiving undefined purchasedKey.body
  const keyAsBuffer = Buffer.from(key, 'base64')
  const decryptionKey = await window.crypto.subtle.importKey(
    'raw',
    Uint8Array.from(keyAsBuffer),
    {
      name: 'AES-GCM'
    },
    true,
    ['decrypt']
  )
  console.time('Decrypt result response time')
  const decryptedResult = await decrypt(new Uint8Array(encryptedData), decryptionKey, 'Uint8Array')
  console.timeEnd('Decrypt result response time')

  // test.resolve()

  // Assuming decryptedResult is a Uint8Array as we specified "Uint8Array" as returnType
  const binaryData = decryptedResult // Directly use the Uint8Array

  // Use binaryData to create the Blob
  const dataBlob = new Blob([binaryData])

  // Create a URL for the blob
  return URL.createObjectURL(dataBlob)
}

export default decryptSong
