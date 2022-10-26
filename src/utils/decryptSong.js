import { Authrite } from 'authrite-js'
import { decrypt } from 'cwi-crypto'
import { createAction, getPublicKey } from '@babbage/sdk'
import bsv from 'babbage-bsv'
import { download } from 'nanoseek'
import constants from './constants'
import pushdrop from 'pushdrop'

export default async ({ song }) => {
  const { data: encryptedData } = await download({
    URL: song.songFileURL,
    bridgeportResolvers: constants.bridgeportResolvers
  })

  // Get purchcase invoice from key-server recipient
  const invoiceResponse = await new Authrite().request(
    `${constants.keyServerURL}/invoice`, {
      body: {
        songURL: song.songFileURL
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  const invoice = (JSON.parse(Buffer.from(invoiceResponse.body).toString('utf8')))
  const paymentDescription = `You listened to ${song.title}, by ${song.artist}`
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

  const unlockingScript = await pushdrop.redeem({
    // To unlock the token, we need to use the same tempo protocol
    // and key ID as when we created the tsp token before. Otherwise, the
    // key won't fit the lock and the Bitcoins won't come out.
    protocolID: 'tempo',
    keyID: '1',
    // We're telling PushDrop which previous transaction and output we want to unlock, so that the correct unlocking puzzle can be prepared.
    prevTxId: song.token.txid,
    outputIndex: song.token.outputIndex,
    // We also give PushDrop a copy of the locking puzzle ("script") that
    // we want to open, which is helpful in preparing to unlock it.
    lockingScript: song.token.lockingScript,
    // Finally, the amount of Bitcoins we are expecting to unlock when the
    // puzzle gets solved.
    outputAmount: song.sats
  })

  const updatedBitcoinOutputScript = await pushdrop.create({
    fields: [
      Buffer.from(constants.tempoBridge, 'utf8'), // Protocol Namespace Address
      Buffer.from(song.title, 'utf8'),
      Buffer.from(song.artist, 'utf8'),
      // Buffer.from(song.artistIdentityKey, 'utf8'),
      Buffer.from(song.description, 'utf8'), // TODO: Add to UI
      Buffer.from('' + song.duration, 'utf8'), // Duration
      Buffer.from(song.songFileURL, 'utf8'),
      Buffer.from(song.artworkFileURL, 'utf8')
    ],
    protocolID: 'tempo',
    keyID: '1'
  })

  const payment = await createAction({
    description: paymentDescription,
    inputs: {
      [song.token.txid]: {
        ...song.token,
        outputsToRedeem: [{
          index: song.token.outputIndex,
          unlockingScript
        }]
      }
    },
    outputs: [{
      script,
      satoshis: parseInt(invoice.amount)
    },
    {
      script: updatedBitcoinOutputScript,
      satoshis: song.sats
    }],
    bridges: [constants.tempoBridge]
  })
  // Send the recipient proof of payment
  const purchasedKey = await new Authrite().request(`${constants.keyServerURL}/pay`, {
    body: {
      derivationPrefix,
      songURL: song.songFileURL,
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
  const decryptedData = await decrypt(
    new Uint8Array(encryptedData),
    decryptionKey,
    'Uint8Array'
  )
  // test.resolve()
  const dataBlob = new Blob([decryptedData])
  return URL.createObjectURL(dataBlob)
}
