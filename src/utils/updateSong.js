import constants from './constants'
import pushdrop from 'pushdrop'
import { createAction } from '@babbage/sdk'
import getFileUploadInfo from '../utils/getFileUploadInfo'
import { upload, submitPayment } from 'nanostore-publisher'
import { toast } from 'react-toastify'
import { Authrite } from 'authrite-js'

export default async ({ song, filesToUpdate }) => {
  // Problems to consider:
  // What functionality is common between publish, update, delete?
  // Can we move some out into a shared function?
  // How do we determine if the multimedia needs t be updated?

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

  // If we need to...
  const fileUploadInfo = await getFileUploadInfo({ selectedArtwork: filesToUpdate.selectedArtwork, selectedMusic: filesToUpdate.selectedMusic })

  if (fileUploadInfo.songURL) {
    song.songFileURL = fileUploadInfo.songURL
  }
  if (fileUploadInfo.artworkFileURL) {
    song.artworkFileURL = fileUploadInfo.artworkFileURL
  }

  debugger
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
  // debugger
  const tx = await createAction({
    description: `Song ${song.title} updated!`,
    inputs: {
      [song.token.txid]: {
        ...song.token,
        outputsToRedeem: [{
          index: song.token.outputIndex,
          unlockingScript
        }]
      }
    },
    outputs: [
      {
        script: updatedBitcoinOutputScript,
        satoshis: song.sats
      }, ...fileUploadInfo.outputs],
    bridges: [constants.tempoBridge]
  })

  // TODO: move upload and pay to function
  for (let i = 0; i < fileUploadInfo.filesToUpload.length; i++) {
    // Submit the payment to nanostore
    const paymentResult = await submitPayment({
      config: {
        nanostoreURL: constants.nanostoreURL
      },
      orderID: fileUploadInfo.invoices[i].ORDER_ID,
      amount: fileUploadInfo.invoices[i].amount,
      payment: tx,
      derivationPrefix: fileUploadInfo.invoices[i].derivationPrefix,
      derivationSuffix: fileUploadInfo.invoices[i].derivationSuffix,
      vout: i + 1
    })
    // Upload the file to nanostore
    const uploadObject = {
      config: {
        nanostoreURL: constants.nanostoreURL
      },
      uploadURL: paymentResult.uploadURL, // wrong
      publicURL: fileUploadInfo.invoices[i].publicURL,
      file: fileUploadInfo.filesToUpload[i],
      serverURL: constants.nanostoreURL
    }
    const response = await upload(uploadObject)
    console.log(response.publicURL)
  }

  if (fileUploadInfo.encryptionKey) {
  // Export encryption key to store on the keyServer // TODO: Move
    const decryptionKey = await window.crypto.subtle.exportKey('raw', fileUploadInfo.encryptionKey)
    const response = await new Authrite().request(`${constants.keyServerURL}/publish`, {
      body: {
        songURL: fileUploadInfo.songURL,
        key: Buffer.from(decryptionKey).toString('base64')
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.status !== 200) {
      // toast.error('Failed to publish song! Please upload a valid media type of mp3, m4a, or wav')
      return false
    }
  }
  // toast.success('Song successfully updated!')
}
