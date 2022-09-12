import { Authrite } from 'authrite-js'
import { decrypt } from 'cwi-crypto'
import { toast } from 'react-toastify'
import { createAction, getPublicKey } from '@babbage/sdk'
import bsv from 'bsv'

const KEY_SERVER_BASE_URL =
  process.env.REACT_APP_TEMPO_KEY_SERVER_URL ||
  'http://localhost:8080'

export default async (baseURL, songURL) => {
  const response = await fetch(
    baseURL + songURL
  )
  const encryptedData = await response.arrayBuffer()

  // Get purchcase invoice from key-server recipient
  const invoiceResponse = await new Authrite().request(
    `${KEY_SERVER_BASE_URL}/invoice`, {
      body: {
        songURL
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  toast.success('Loading song...')
  const invoice = (JSON.parse(Buffer.from(invoiceResponse.body).toString('utf8')))
  const paymentDescription = `Here is payment for the song: ${songURL}`
  // Pay the recipient
  const derivationPrefix = require('crypto')
    .randomBytes(10)
    .toString('base64')
  const derivationSuffix = require('crypto')
    .randomBytes(10)
    .toString('base64')
  // Derive the public key used for creating the output script
  const derivedPublicKey = await getPublicKey({
    protocolID: [2, '3241645161d8'],
    keyID: `${derivationPrefix} ${derivationSuffix}`,
    counterparty: invoice.identityKey
  })
  // Create an output script that can only be unlocked with the corresponding derived private key
  const script = new bsv.Script(
    bsv.Script.fromAddress(bsv.Address.fromPublicKey(
      bsv.PublicKey.fromString(derivedPublicKey)
    ))
  ).toHex()
  const payment = await createAction({
    description: paymentDescription,
    outputs: [{
      script,
      satoshis: parseInt(invoice.amount)
    }]
  })
  // Send the recipient proof of payment
  const purchasedKey = await new Authrite().request(`${KEY_SERVER_BASE_URL}/pay`, {
    body: {
      derivationPrefix,
      songURL,
      transaction: {
        ...payment,
        outputs: [{
          vout: 0,
          satoshis: invoice.amount,
          derivationSuffix
        }]
      },
      orderID: invoice.orderID
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  // Parse out the decryption key and decrypt the song data
  const key = (JSON.parse(Buffer.from(purchasedKey.body).toString('utf8'))).result
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
  const decryptedData = await decrypt(new Uint8Array(encryptedData), decryptionKey, 'Uint8Array')
  const dataBlob = new Blob([decryptedData])
  return URL.createObjectURL(dataBlob)
}
